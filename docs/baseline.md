# Baseline and measurement protocol

- **Task:** T00 — `chore/decouple-00-baseline`
- **Status:** Protocol and tooling committed. Numeric capture is pending an isolated
  environment (see [Prerequisites](#10-prerequisites-and-known-gaps)).
- **Purpose:** Establish the numbers that every later task is compared against, so
  "no performance regression" and "behavior unchanged" are measured rather than assumed.

## 1. What gets captured

| Layer | Metrics | Source |
| --- | --- | --- |
| HTTP API | Requests, error rate, p50/p95/p99 latency, response bytes, status distribution | Load generator against `next start` |
| Database | Per-collection read/write counts, top query shapes, `docsExamined` / `keysExamined`, index used | MongoDB profiler and `explain("executionStats")` |
| SSE | Time to first event, time to first token, inter-event gaps, completion time, abort behavior | Dedicated streaming client |
| Pages | LCP, INP, CLS, TTFB for the primary platform routes | Lighthouse CI / `web-vitals` |
| Process | RSS, event-loop lag, open handles | Node process sampling |
| Schema | Collection names, options, indexes, document counts | `scripts/mongo-fingerprint.js` |

Latency is always reported per operation (`METHOD /api/path`), never as a single global
average. A fast `GET` must not hide a slow AI endpoint.

## 2. Reference environment

Record these values with every capture. A baseline without an environment record is invalid.

| Field | Value |
| --- | --- |
| Frontend commit | `5aa4c1e228f286c779fc419110d772663766fa79` (branch `rd/ui-02/explore`) |
| Baseline date | 2026-10-25 |
| Node target | 22 LTS (local capture used Node 24.14.1; pin before T01) |
| Package manager | pnpm 10.15.0 |
| MongoDB (local fingerprint) | 8.0.4, database `neuron`, 36 collections |
| Redis | Required; not running on the capture host at T00 |
| OS | Linux |
| Deployment mode | `next build` + `next start`, single instance, local MongoDB and Redis |
| AI provider | Mocked for parity; live smoke only, never part of a latency budget |

## 3. Deterministic dataset

Numeric baselines and parity fixtures must run against the same data.

1. Clone the database, including indexes, and never touch the source:
   ```bash
   mongodump --uri="mongodb://localhost:27017/neuron" --out=/tmp/neuron-baseline
   mongorestore --uri="mongodb://localhost:27017" \
     --nsFrom='neuron.*' --nsTo='neuron_baseline.*' /tmp/neuron-baseline
   ```
   `mongosh`-based copies do not preserve indexes and are not acceptable for a baseline.
   Never seed or reset a database that contains user work.
2. Point the app at the copy with `MONGODB_URI=mongodb://localhost:27017/neuron_baseline`.
3. Seed users are defined in `src/database/seed.ts` and use the same test-only password as the
   seed script. Do not copy that password into fixtures, logs, or documentation; fixtures load
   it from the test seed module.
   - `alex@example.com` — `alex_explorer`
   - `jordan@example.com` — `jordan_scholar`
   - `casey@example.com` — `casey_sage`
4. If a role matrix is required, create dedicated `admin`, `curator`, `contributor`, and `user`
   accounts with fixed IDs in the fixture setup. Do not promote seeded users in place.
5. Flush Redis (`FLUSHDB`) before every capture and between scenarios.
6. Record the starting document counts from `docs/mongo-fingerprint.json`.

## 4. Capture procedure

### 4.1 Build and boot

```bash
pnpm install --frozen-lockfile
pnpm build
NODE_ENV=production pnpm start
```

Run a single instance. Horizontal scaling changes cache hit rates and must be measured
separately in T17.

### 4.2 Warm-up

- Send 30 seconds of traffic at 10% of target load before measuring.
- Discard warm-up samples.
- Confirm `/api/health` reports `database.connected: true` and that Redis is reachable.

### 4.3 Steady state

- 5 minutes per scenario, or 1,000 requests per operation, whichever is longer.
- Report the sample size with every percentile.
- Keep concurrency below the point where the host CPU saturates; this is a regression
  baseline, not a capacity test.

### 4.4 Error and edge paths

Capture these explicitly, because they are the most likely to drift during the port:

- `401` unauthenticated, `403` insufficient role, `404` missing resource, `409` duplicate slug,
  `422`/`400` validation failure, `429` rate limit.
- Pagination at the cap, empty result sets, and the last page.
- CSRF missing, mismatched, and valid.
- SSE client abort and upstream timeout.
- Concurrent XP increments on the same user (lost-update detector).

### 4.5 SSE

Measure with a client that does not buffer:

- Time to first byte and time to first `data:` event.
- Event count and order for a fixed prompt/input.
- Completion time and terminal event.
- Behavior on abort and on the 5.5-second Spark timeout budget.

AI output is nondeterministic. Record structure, event names, and timing. Never diff generated
prose.

## 5. Metric definitions

| Metric | Definition |
| --- | --- |
| p50/p95/p99 | Nearest-rank percentile over successful (`2xx`/`3xx`) responses; failures reported separately |
| Error rate | `5xx` responses divided by all responses |
| Response bytes | Compressed body size when compression is enabled; record whether it was enabled |
| DB query p95 | Server-side duration from the profiler for the query shape, not client round-trip |
| SSE first token | Time from request start to the first non-empty token payload |
| Page LCP | 75th percentile across five cold runs per route with a warm server |

## 6. Acceptance budgets

These are the numbers later tasks are held to.

| Area | Budget |
| --- | --- |
| API p95 | No worse than legacy; target ≤ 90% of legacy after T17 |
| 5xx rate | < 0.1% |
| DB query p95 | < 100 ms for indexed reads |
| Hot-read cache hit | > 70% |
| Spark SSE first token | No worse than the legacy 5.5 s timeout budget |
| Page LCP / INP | No regression in staging |
| Parity | Zero unapproved diffs |

## 7. Storage and naming

```text
docs/baseline/
  2026-10-25/
    environment.json
    http.json
    db.json
    sse.json
    pages.json
    summary.md
```

- One directory per capture date.
- `summary.md` is the human-readable report; JSON files are the raw evidence.
- `environment.json` includes commit SHAs, Node version, Mongo/Redis versions, host CPU/RAM,
  and the feature flags in effect.
- Never overwrite a capture. A new run gets a new timestamp.

## 8. Database fingerprint

`docs/mongo-fingerprint.json` is the T00 schema baseline:

- 36 collections, captured from MongoDB 8.0.4.
- Includes every collection's options and index definitions.
- Contains no document contents.

Regenerate read-only:

```bash
mongosh "mongodb://localhost:27017/neuron" --quiet --file scripts/mongo-fingerprint.js \
  > docs/mongo-fingerprint.json
```

T04 must diff this file against the Nest-owned database and show an empty index diff (ignoring
`capturedAt` and document counts). Any index addition must be justified with `explain()`.

## 9. Reporting

`summary.md` must contain:

1. Environment table.
2. Per-operation table: operation, samples, p50, p95, p99, error rate, bytes.
3. Top ten DB query shapes with `docsExamined`, `keysExamined`, and the chosen index.
4. SSE table.
5. Page table.
6. Comparison against the previous capture, if one exists.
7. Explicit list of anything that could not be measured, with the reason.

## 10. Prerequisites and known gaps

The protocol is committed, but the numeric report is **not** yet captured. Current blockers:

- Redis is not running on the capture host, so rate-limit and cache behavior cannot be measured
  faithfully.
- Local Node is 24.14.1; the target is 22 LTS. Capture on the pinned version.
- No load generator is installed (k6 is absent). The T03 harness and T17 load tests will
  provide one; until then, a small Node-based runner is sufficient for smoke numbers.
- The local database contains developer data. Use a cloned database, never seed over it.

T00 exit gate is therefore partially met:

- [x] Route inventory committed (`docs/legacy-route-inventory.md`)
- [x] ADR committed (`docs/adr/0001-backend-repository-and-stack.md`)
- [x] Mongo fingerprint committed (`docs/mongo-fingerprint.json`)
- [x] Baseline protocol committed (this document)
- [ ] Numeric baseline captured on a pinned, isolated environment
- [ ] Representative fixtures recorded (T03)

The unchecked items are the first actions of T03, not reasons to delay T01.
