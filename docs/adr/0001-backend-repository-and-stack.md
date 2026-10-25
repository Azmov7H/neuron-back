# ADR-001: Separate backend repository, NestJS API, and shared packages

- **Status:** Accepted
- **Date:** 2026-10-25
- **Task:** T00 — `chore/decouple-00-baseline`
- **Supersedes:** the single-repository layout proposed in `docs/backend-decoupling-plan.md` §3
  (`frontend/` + `backend/` + `packages/` in one repository).

## Context

The current Next.js application owns both the UI and the backend. The coupling is at the
import level: route handlers live under `app/api`, domain services and Mongoose models live
under `src/`, server components import JWT verification code, and the frontend build depends
on backend-only packages such as `mongoose`, `bcrypt`, `jsonwebtoken`, `redis`, and `openai`.

The migration plan assumed one repository restructured into `frontend/`, `backend/`, and
`packages/`. The backend now lives in a dedicated repository,
[`Azmov7H/neuron-back`](https://github.com/Azmov7H/neuron-back), while the Next.js application
remains in `Azmov7H/neuron`. The two applications must be independently buildable and
deployable, so the plan's repository layout has to be reconciled before T01 starts.

Constraints that shape this decision:

1. Business logic must be lifted and shifted, not rewritten.
2. MongoDB collection names, document shapes, and indexes must not change during the move.
3. The frontend must stop importing backend code and backend-only libraries.
4. Shared types and pure simulation logic need one source of truth without duplicating domain
   rules across repositories.
5. Rollback must be a runtime flag, not a redeploy of the frontend.

## Decision

### 1. Two repositories, two deployables

| Repository | Application | Owns |
| --- | --- | --- |
| `Azmov7H/neuron` | Next.js 16 frontend | Pages, components, hooks, browser state, the HTTP client, middleware used only for UX redirects |
| `Azmov7H/neuron-back` | NestJS API | Auth, RBAC, validation, business services, Mongoose models, Redis, AI providers, audit logs, telemetry ingestion |

There is no `frontend/` directory move and no Vercel root change. The repository split is the
physical separation. The frontend repository keeps its current structure until T21 removes the
legacy `app/api` and backend `src/` code.

### 2. The API is the only writer and the only authority

- The frontend never imports from `@/database`, `@/modules`, `@/lib/auth`, or any
  backend-only package outside `app/api`.
- The frontend middleware only redirects when the session cookie is absent. It does not verify
  JWTs and does not enforce authorization.
- Server components forward the incoming `Cookie` header to `GET /api/v1/auth/session`.
- Exactly one writer is active per module at any time, selected by a runtime cutover flag.
  Dual writes are prohibited.

### 3. Backend stack

| Concern | Choice |
| --- | --- |
| Runtime | Node.js 22 LTS in CI and production; local Node 24 is acceptable but must be pinned before T01 |
| Framework | NestJS, current stable at scaffolding time, pinned in `package.json` |
| Language | TypeScript, strict mode |
| HTTP prefix | `/api/v1` using Nest URI versioning |
| Database | MongoDB via Mongoose; existing database, collection names, and indexes |
| Cache / rate limits | Redis |
| Validation | Zod schemas shared through `@azmov7h/neuron-contracts`, enforced by a Nest pipe |
| API docs | OpenAPI generated from controllers and checked in |
| Logging | Structured JSON with request IDs; secrets and tokens redacted |
| Testing | Vitest or Jest for units, Supertest for e2e, black-box parity suite for behavior |

Exact versions are pinned in T04. No ORM or schema migration is introduced; the existing
Mongoose models move 1:1.

### 4. Shared code distribution

Two packages are shared:

- `@azmov7h/neuron-contracts` — DTOs, Zod schemas, response envelope, error codes, roles, and
  route constants.
- `@azmov7h/neuron-simulation-core` — pure registry, types, schemas, sanitizers, and math used
  by both the browser engine and the server assessment.

They live in `neuron-back/packages/` and are published to **GitHub Packages** as versioned
artifacts. The frontend consumes pinned semver versions.

- The package scope must match the GitHub owner because GitHub Packages requires it; therefore
  `@azmov7h/*`, not `@neuron/*`.
- The backend repository uses a pnpm workspace: `apps/api`, `packages/contracts`,
  `packages/simulation-core`.
- Local cross-repository development uses `pnpm link` or a `pnpm.overrides` path. CI always
  installs from the registry so a release is reproducible.
- Pre-release versions use `0.x.y-dev.<sha>`; only tagged releases are allowed in `main`.
- Both packages must be framework-free: no `next`, `react`, `mongoose`, Nest, `process.env`, or
  Node-only APIs in code that the browser imports.

Until T02 creates and publishes the packages, the frontend keeps its local copies. The
duplication is temporary and ends in T02, not in T21.

### 5. Configuration and secrets

- Each repository has its own environment contract. The frontend receives only
  `NEXT_PUBLIC_API_BASE_URL` and public analytics keys.
- `JWT_SECRET`, `MONGODB_URI`, `REDIS_URL`, AI keys, and `DASHBOARD_SECRET` exist only in the
  backend environment.
- Production secrets come from a secret manager. `.env` files are local-only and ignored.
- The frontend must boot with the backend stopped; failures surface as API errors, not build
  errors.

### 6. API and data compatibility

- Existing paths `/api/<domain>/...` map to `/api/v1/<domain>/...`. Resource names, query
  parameters, pagination caps, status codes, and the response envelope are unchanged.
- `ObjectId` and `Date` values are serialized exactly as the legacy handlers serialize them.
- Cookie names, TTLs, and attributes are preserved. Approved deltas are listed in the plan and
  in the parity allowlist, not applied silently.
- No collection renames, no field renames, and no destructive migrations.

### 7. Deployment

- Frontend: existing Vercel project, unchanged root.
- Backend: Vercel Functions using the NestJS framework preset, deployed from the GitHub
  integration in this repository. See [ADR-002](0002-vercel-serverless-hosting.md), which
  supersedes the original container plan.
- `/api/v1/health` is the liveness probe; readiness checks are added in T04.
- Cutover and rollback are controlled by module flags read at request time. The legacy Next
  route handlers remain available for the seven-day soak window.

## Consequences

**Positive**

- The two applications can be built, released, and scaled independently.
- Backend secrets and dependencies leave the frontend bundle.
- Shared contracts and simulation logic have one owner and a real release process.
- Repository-level CI can enforce the boundary with a simple import check.

**Negative / costs**

- A change to a shared package requires a publish and a frontend version bump.
- Two repositories mean two issue trackers, two CI configurations, and cross-repository PRs.
- Local development needs linking or a pre-release channel.
- The frontend repository temporarily contains both legacy backend code and a new HTTP client
  until T21.

**Risks**

- Version skew between the published contracts and the running API. Mitigation: the frontend
  pins exact versions and the parity suite fails on drift.
- The shared package becomes a dumping ground. Mitigation: T02 exit gate forbids framework,
  database, and environment imports in both packages.

## Alternatives considered

| Alternative | Why rejected |
| --- | --- |
| Keep one monorepo and move Next into `frontend/` | Contradicts the decision to keep the backend in its own repository; adds a disruptive move with no migration benefit |
| Third repository `neuron-shared` for contracts and simulation core | Clean, but adds a third release pipeline and a third place to review changes; the backend repository already owns the API contract |
| OpenAPI-only code generation, no shared runtime package | Types alone cannot carry Zod validation, route constants, or the simulation math; would duplicate simulation rules |
| Duplicate the contracts and simulation core in both repositories | Guarantees drift in ranking thresholds, validation messages, and simulation clamping |
| Git submodule of `neuron-back` inside `neuron` | Couples deploys, breaks independent CI, and makes rollback ambiguous |

## Compliance

- T04 must reproduce `docs/mongo-fingerprint.json` (ignoring `capturedAt` and document counts)
  before any domain controller is merged.
- `@azmov7h/neuron-contracts` and `@azmov7h/neuron-simulation-core` must have no framework,
  database, or environment imports; this is checked in CI.
- The T16 boundary check becomes blocking once the frontend transport lands.
- Any new shared package requires a new ADR.

## Follow-ups

1. **Plan amendment for T01 (approved 2026-10-25).** The repository owner selected
   "two repositories + GitHub Packages". The original T01, which moved the Next.js app into
   `frontend/` and made the root a pnpm workspace, no longer applies. Replacement scope:
   - In `neuron-back`: create the pnpm workspace (`apps/api`, `packages/contracts`,
     `packages/simulation-core`), lint/format/typecheck/test CI, Dependabot, and the GitHub
     Packages release workflow. No Nest application yet.
   - In `neuron`: add `NEXT_PUBLIC_API_BASE_URL` support to the typed client, defaulting to
     same-origin so behavior is unchanged, and add a non-blocking guard against new imports
     of backend modules outside `app/api`.
   - Exit: both repositories build; no runtime behavior changes; a path-import fixture proves
     the frontend can target an external API base URL.
2. **T02 location.** Both packages live in `neuron-back/packages/` and are published from there.
   The frontend's local `src/lib/simulation` copy is removed only when the published package
   passes the existing 13 simulation test files.
3. **GitHub Packages authentication.** Add `.npmrc` with
   `@azmov7h:registry=https://npm.pkg.github.com` to both repositories, and document the
   `NODE_AUTH_TOKEN` requirement for CI and contributors.
