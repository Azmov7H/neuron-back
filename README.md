# neuron-back

NestJS + MongoDB API for Neuron, extracted from the legacy Next.js monolith.

This repository is the backend half of the frontend/backend split. The Next.js application
stays in [`Azmov7H/neuron`](https://github.com/Azmov7H/neuron). The two applications are
independently buildable and deployable.

> **Status:** T00 (baseline, inventory, ADR) — no runtime code yet. The NestJS application is
> scaffolded in T04.

## Documents

| Document | Purpose |
| --- | --- |
| Full plan | `docs/backend-decoupling-plan.md` in the frontend repo (currently uncommitted on `rd/ui-02/explore`) |
| [`docs/adr/0001-backend-repository-and-stack.md`](docs/adr/0001-backend-repository-and-stack.md) | Why two repositories, the backend stack, and how shared packages are distributed |
| [`docs/legacy-route-inventory.md`](docs/legacy-route-inventory.md) | Generated inventory of all 85 legacy route handlers and 124 operations |
| [`docs/baseline.md`](docs/baseline.md) | Measurement protocol, metric definitions, and acceptance budgets |
| [`docs/parity-harness.md`](docs/parity-harness.md) | Golden-master record/replay contract for proving behavior is unchanged |
| [`docs/mongo-fingerprint.json`](docs/mongo-fingerprint.json) | Read-only collection and index fingerprint captured at T00 |
| [`docs/tasks/T00-baseline.md`](docs/tasks/T00-baseline.md) | T00 branch, scope, evidence, and exit gate |

## Principles

1. **Lift and shift.** Business logic is moved, not rewritten. Ranking thresholds, XP rules,
   recommendation ordering, pagination caps, validation messages, simulation clamping, and AI
   fallback tiers stay identical.
2. **One writer per module.** A runtime flag selects legacy or Nest for a module. Dual writes
   are prohibited.
3. **The API is the only authority.** The frontend never verifies JWTs and never imports
   backend code or backend-only packages.
4. **No schema changes during the move.** Same MongoDB database, collections, documents, and
   indexes.
5. **Measure, don't assume.** Every endpoint has recorded-response parity and a latency budget.
6. **Security deltas are explicit.** Every intentional behavior change is listed in the plan and
   in the parity allowlist.

## Local prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 22 LTS (pin before T01) |
| pnpm | 10.15.0 |
| MongoDB | 8.x |
| Redis | 7.x |

## Repository conventions

- Trunk-based development. Short-lived branches cut from `main`.
- Branch names follow the task board: `chore/decouple-00-baseline`,
  `feat/decouple-05-auth`, and so on.
- Conventional commits with the task scope:
  `docs(decouple-00): add route inventory, ADR, and baseline protocol`.
- One branch and one task comment per task. The comment template is in the plan, §5.
- Required checks: lint, typecheck, unit tests, parity/contract tests, production build,
  secret scan, and dependency audit.

## Regenerating the inventory

The inventory is generated from the frontend repository. Run it whenever a route is added or
removed, and commit the result:

```bash
node scripts/inventory-legacy-routes.mjs --frontend ../neuron --out docs/legacy-route-inventory.md
node scripts/inventory-legacy-routes.mjs --frontend ../neuron --out docs/legacy-route-inventory.md --check
```

`--check` exits non-zero when the committed file is stale and is intended for CI.

## Regenerating the Mongo fingerprint

Read-only; it never reads document contents:

```bash
mongosh "mongodb://localhost:27017/neuron" --quiet --file scripts/mongo-fingerprint.js \
  > docs/mongo-fingerprint.json
```

## Planned layout

```text
apps/api/                  NestJS application
packages/contracts/        @azmov7h/neuron-contracts
packages/simulation-core/  @azmov7h/neuron-simulation-core
scripts/                   Reproducible inventories and fingerprints
docs/                      ADRs, baselines, parity contract, task records
test/parity/               Fixtures, recordings, and the parity runner (T03)
```
