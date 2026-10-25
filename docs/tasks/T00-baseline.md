# T00 — Baseline, inventory, and ADR

```text
Branch: chore/decouple-00-baseline
Base: main
Depends on: none
Scope: inventory the legacy surface; record the Mongo fingerprint; write ADR-001 and the
       baseline/parity protocols. No runtime changes, no Next.js edits, no database writes.
Business logic: frozen. No handler, service, model, or schema is modified.
Parity: harness contract defined in docs/parity-harness.md; fixtures are recorded in T03.
Performance: protocol, metrics, and budgets defined in docs/baseline.md; numeric capture is
             the first action of T03 on a pinned, isolated environment.
Security: dashboard secret leak, client-supplied XP, CSRF cookie mismatch, dormant subscribers,
          and non-atomic XP writes are recorded as reviewed deltas; none are fixed here.
Exit: inventory, ADR, fingerprint, and protocols merged; inventory reproducible.
Rollback: revert this branch. It adds documentation and read-only scripts only.
```

## What was delivered

| Artifact | Description |
| --- | --- |
| `docs/legacy-route-inventory.md` | Generated inventory of 85 route handlers and 124 HTTP operations |
| `scripts/inventory-legacy-routes.mjs` | Reproducible generator with `--check` mode for CI |
| `docs/mongo-fingerprint.json` | Read-only fingerprint: 36 collections, options, indexes, counts |
| `scripts/mongo-fingerprint.js` | Reproducible `mongosh` capture; never reads document contents |
| `docs/adr/0001-backend-repository-and-stack.md` | Repository split, NestJS/MongoDB stack, shared-package distribution |
| `docs/baseline.md` | Metrics, deterministic dataset, capture procedure, budgets, known gaps |
| `docs/parity-harness.md` | Fixture format, normalization rules, comparison rules, allowlist, CI |

## Inventory findings

- **85 route handler files**, **124 HTTP operations**. The plan's headline count of 85 refers
  to files; the actual operation count is 124 because several files export multiple methods.
- **67 routes are referenced by UI code; 18 are not.** Each unreferenced route needs an
  explicit port/deprecate/internal-only decision.
- **8 public operations:** CSRF bootstrap, login, register, refresh, logout, health, evolution
  leaderboard, and simulation config.
- **2 SSE operations:** `POST /api/spark/chat` and `POST /api/simulations/interpret`.
- **4 rate-limited operations** and **6 CSRF-protected operations**.
- **18 unreferenced routes**, including:
  - `/api/dashboard/secret` — remove; leaks `DASHBOARD_SECRET`.
  - `/api/evolution/add-xp` — remove or make internal; trusts client XP.
  - `/api/auth/refresh` — no UI caller, but required by the cookie rotation contract.
  - `/api/spark/sessions`, `/api/spark/context`, `/api/spark/history` — no UI caller; confirm
    before porting.
  - `/api/cognitive/context`, `/api/cognitive/discoveries`,
    `/api/cognitive/recommendations`, `/api/cognitive/graph/nodes/edge`,
    `/api/explore/concepts`, `/api/explore/recommendations`, `/api/evolution/stats`,
    `/api/evolution/streak`, `/api/neural-paths/start`, `/api/neural-paths/stats`,
    `/api/action`.

## Domain summary

| Domain | Files | Operations |
| --- | ---: | ---: |
| `knowledge` | 35 | 66 |
| `cognitive` | 10 | 17 |
| `explore` | 6 | 7 |
| `evolution` | 6 | 6 |
| `auth` | 5 | 5 |
| `neural-paths` | 5 | 5 |
| `simulations` | 4 | 4 |
| `spark` | 4 | 4 |
| `dashboard` | 2 | 2 |
| `recommendations` | 2 | 2 |
| `action`, `dock`, `health`, `navigation`, `notifications`, `users` | 1 each | 1 each |
| **Total** | **85** | **124** |

## Exit gate

- [x] Route inventory committed and reproducible
- [x] ADR-001 committed
- [x] Mongo collection/index fingerprint committed
- [x] Baseline protocol and acceptance budgets committed
- [x] Parity harness contract committed
- [ ] Numeric baseline captured on Node 22 LTS, Redis enabled, cloned database (T03)
- [ ] Representative fixtures recorded (T03)

The two unchecked items require an isolated environment and belong to T03. They do not block
T01, which only creates the workspace and release pipeline.

## Decision (approved 2026-10-25)

The repository owner selected **two repositories + GitHub Packages**. ADR-001 is accepted as
written, including the replacement T01 scope. T01 may start; it must not assume a `frontend/`
directory move or a Vercel root change.

T01 is split across the two repositories:

- `neuron-back` on `chore/decouple-01-workspace`: pnpm workspace, packages, CI, Dependabot,
  and the GitHub Packages release pipeline.
- `neuron` on the same branch name: `NEXT_PUBLIC_API_BASE_URL` support and the import-boundary
  guard. This half is blocked until the local `rd/ui-02/explore` commit `5aa4c1e` is pushed,
  because branching now would include the user's unpushed work in the T01 PR.
