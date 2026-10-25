# Golden-master parity harness

- **Task:** T00 specifies the contract; T03 implements it.
- **Purpose:** Prove that the NestJS API behaves like the legacy Next.js handlers for every
  operation the UI uses, without reading either implementation.
- **Principle:** Record real HTTP traffic against the legacy app, replay the same requests
  against the Nest app, normalize only what is legitimately variable, and fail on any
  unapproved difference.

## 1. Model

```text
fixture.json
    │
    ├─ record mode ──► legacy Next handler ──► raw response ──► normalize ──► expected.json
    │
    └─ verify mode ──► Nest API ─────────────► raw response ──► normalize ──► compare
                                                                                 │
                                                                          allowlist.json
```

- **Record mode** runs only against a local or staging legacy deployment. It refuses to run
  when `NODE_ENV=production` or when the target host is not in the allowlist.
- **Verify mode** runs against any base URL. It is the mode used by CI and by module owners.
- The suite is black-box: it imports no application code, starts no in-process handlers, and
  speaks only HTTP.
- Recording is committed. Verification must not require the legacy app to be running.

## 2. Fixture format

One JSON file per scenario under `test/parity/fixtures/<module>/<id>.json`.

```json
{
  "id": "auth.login.success",
  "module": "auth",
  "description": "Valid credentials return the user and set both auth cookies",
  "setup": {
    "database": "core",
    "users": ["user"],
    "clock": "2026-01-01T00:00:00.000Z",
    "redis": "empty"
  },
  "steps": [
    {
      "id": "csrf",
      "request": { "method": "GET", "path": "/api/auth/csrf" },
      "capture": { "cookies": ["neuron_csrf"], "json": "$.data.csrfToken" }
    },
    {
      "id": "login",
      "request": {
        "method": "POST",
        "path": "/api/auth/login",
        "headers": { "x-csrf-token": "${csrf.csrfToken}" },
        "cookies": { "neuron_csrf": "${csrf.cookies.neuron_csrf}" },
        "json": { "email": "alex@example.com", "password": "<seed-password>" }
      }
    }
  ],
  "expect": {
    "status": 200,
    "headers": {
      "content-type": "application/json",
      "set-cookie": ["neuron_session", "neuron_refresh", "neuron_csrf"]
    },
    "json": {
      "success": true,
      "message": "Login successful",
      "data.user.email": "alex@example.com"
    }
  },
  "normalize": ["objectId", "isoDate", "etag", "requestId", "setCookieAttributes", "jwt"]
}
```

### Field rules

| Field | Rule |
| --- | --- |
| `id` | Stable, unique, `module.scenario.outcome` |
| `module` | Owning Nest module; used to select and report coverage |
| `setup` | Declarative only. The harness owns the seed and teardown |
| `steps` | Ordered; later steps can reference earlier captures with `${step.path}` |
| `expect.status` | Exact integer |
| `expect.headers` | Only the listed headers are compared; `set-cookie` compares cookie names and flags, not values |
| `expect.json` | JSONPath-like subset match; `null` asserts absence |
| `normalize` | Names from the table in §4; applied before comparison |

Fixtures must not contain raw JWTs, session IDs, or AI prose. Use capture references and
normalizers instead.

## 3. Scenario setup

The harness controls state; a fixture never creates data by calling the API under test.

- **Database:** each scenario runs against a disposable database seeded from
  `test/parity/seed/<dataset>.json`. `core` is the minimum dataset: users for each role, a few
  concepts, one domain, one path, one simulation config.
- **Users:** fixed IDs and emails, role assigned by dataset. Passwords are test-only.
- **Clock:** the harness freezes `Date.now()` in the seeded payloads and asserts against
  normalized timestamps. It does not patch the server process.
- **Redis:** flushed before each scenario. Rate-limit tests declare their own limits through
  environment overrides.
- **AI:** a deterministic mock provider is enabled. Live-provider tests are a separate,
  non-blocking smoke suite.
- **Isolation:** scenarios may run in parallel only when their datasets do not overlap. The
  default is serial per module; read-only GET scenarios may run concurrently.

## 4. Normalization

| Normalizer | Effect |
| --- | --- |
| `objectId` | Replace 24-hex strings with `<objectId>`; preserve field presence |
| `isoDate` | Replace ISO-8601 timestamps with `<date>`; keep ordering when comparing arrays |
| `etag` | Replace `ETag` / `If-None-Match` values with `<etag>`; keep `304` semantics |
| `requestId` | Replace `x-request-id` with `<requestId>` |
| `setCookieAttributes` | Keep cookie name, `HttpOnly`, `Secure`, `SameSite`, `Path`, `Max-Age`; replace values with `<cookie>` |
| `jwt` | Replace JWT-shaped strings with `<jwt>`; compare claims separately only when a scenario asks |
| `float` | Round numbers to 6 decimals |
| `sortById` | Sort arrays by `id`/`_id` before comparison when the API does not guarantee order |
| `stripAiText` | Keep event names, counts, and lengths; replace generated text with `<text>` |
| `legacyVersionPrefix` | Map `/api/v1/<path>` to `/api/<path>` for request comparison |
| `headerCase` | Lowercase header names |

Anything not covered by a normalizer must be deterministic. If it is not, add a normalizer with
a written justification and an owner.

## 5. Comparison rules

A scenario passes only when all of the following match:

1. **Status code** — exact.
2. **Response envelope** — `success`, `message`, `data`, `error.code`, `error.fields`, and
   `statusCode`.
3. **Body** — keys, types, nullability, array length, and order after normalization.
4. **Headers** — the allowlisted headers, including `content-type`, `cache-control`, `etag`, and
   `set-cookie`.
5. **Cookies** — names, flags, path, and TTL. Values are compared only when the scenario
   asserts rotation.
6. **Side effects** — the scenario declares the expected post-state query (document counts, XP
   delta, audit-log entry, discovery, streak) and the harness runs it after the request.
7. **SSE** — event names and order, terminal event, and error frames. Token text is never
   compared; structure and timing budget are.

Failures report the JSON path, expected value, actual value, and the matching normalizer.

## 6. Approved deltas

Intentional behavior changes are listed in `test/parity/allowlist.json`:

```json
[
  {
    "fixture": "dashboard.secret.get",
    "field": "status",
    "expected": 404,
    "reason": "Endpoint removed: leaked DASHBOARD_SECRET to any authenticated user",
    "task": "T09",
    "expires": "2026-12-31"
  }
]
```

Rules:

- An allowlist entry must name the task, the reason, and an expiry.
- CI fails when an entry expires or when its fixture is deleted.
- Allowlist entries are reviewed in the same PR as the behavior change.
- "The new stack returns a different shape" is never a valid reason.

## 7. Coverage matrix

| Category | Minimum coverage |
| --- | --- |
| Reads | Every `GET` operation in `docs/legacy-route-inventory.md` |
| Auth | Register, login, refresh, session, logout, expired token, forged token, missing cookie |
| Authorization | Each role against one read and one write per module |
| Writes | Every `POST`/`PUT`/`PATCH`/`DELETE` that changes state |
| Validation | Missing field, wrong type, unknown key, over-limit pagination, invalid ObjectId |
| CSRF | Missing header, mismatched token, valid token, wrong Origin |
| Errors | `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500` |
| SSE | Spark chat and simulation interpret: first event, order, completion, abort |
| Deprecations | `/api/dashboard/secret`, `/api/evolution/add-xp`, and every unreferenced route in the inventory |

The inventory currently has 85 route handlers and 124 HTTP operations. The initial suite must
cover all 67 routes that the UI references. The 18 unreferenced routes each need an explicit
recorded decision: port, deprecate, or internal-only.

## 8. Determinism checklist

Before a verify run:

- [ ] Disposable database restored from the committed seed.
- [ ] Redis flushed.
- [ ] Mock AI provider enabled and recorded in the report.
- [ ] `TZ=UTC`, `NODE_ENV=test`, fixed `PORT`.
- [ ] Clock-sensitive fields normalized.
- [ ] No live external network calls.
- [ ] The legacy recording and the Nest replay use the same seed and environment overrides.

## 9. Repository layout (T03 target)

```text
test/parity/
  fixtures/
    auth/
    knowledge/
    simulations/
  seed/
    core.json
  recordings/            # normalized expected responses, committed
  allowlist.json
  normalize.ts
  run.ts                 # record | verify | update
  report.ts
```

Commands:

```bash
pnpm parity:record --base-url http://localhost:3000 --module auth
pnpm parity:verify --base-url http://localhost:3001 --module auth
pnpm parity:verify --all
```

## 10. CI

- Job: `parity` after lint, typecheck, and unit tests.
- Services: MongoDB and Redis containers; the API is started by the job.
- No legacy app is required in CI.
- Timeout: 10 minutes for the full suite; a module subset must finish in 2.
- Artifacts: `report.json`, `report.md`, and diffs for every failure.
- The job is required once the first module is ported. Until then it runs in warn mode and
  publishes the coverage gap.

## 11. Non-goals

- Unit-testing individual functions. Those tests move with the code.
- Proving the UI is pixel-identical. That is covered by the frontend route smoke in T15/T16.
- Testing AI output quality. Only structure, fallback tier, and timing are compared.
- Load testing. T17 owns k6 and capacity budgets.
