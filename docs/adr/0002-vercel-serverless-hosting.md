# ADR-002: Host the backend on Vercel Functions via the GitHub integration

- **Status:** Accepted
- **Date:** 2026-10-25
- **Task:** T01 — `chore/decouple-01-vercel-deploy`
- **Supersedes:** ADR-001 §7 (container deployment)

## Context

ADR-001 §7 planned to deploy the API as a container image, health-checked at
`/api/v1/health`. The repository owner has since required the backend to run on **Vercel with the
GitHub integration**, so container hosting is no longer an option.

Two facts shape the implementation:

1. `neuron-back` is a single-application repository. It contains one NestJS app and two pure
   TypeScript packages. There is no second app that needs the `apps/*` split.
2. Vercel has first-class, zero-configuration NestJS support. The framework builder reads
   `src/main.ts`, compiles the Nest application, bundles it into one Vercel Function on Fluid
   compute, and routes every request to Nest's router. It requires the entry file itself to
   import a Nest package; an entry that only re-exports a bootstrap module is rejected with
   `No entrypoint found which imports nestjs`.

The first deployment attempt failed because the project had no framework configured and was
built as a static site:

```text
Error: [STATIC_BUILD_NO_OUT_DIR] No Output Directory named "public" found after the Build completed.
```

The fix is not an empty `public/` directory. It is to configure the project as a NestJS
application and provide a real Nest entry point at the project root.

## Decision

### 1. Hosting model

- **Platform:** Vercel Functions (Node.js runtime, Fluid compute), one function for the whole API.
- **Integration:** the existing GitHub integration for `Azmov7H/neuron-back`.
  - Pushes to `main` create production deployments.
  - Pull requests create preview deployments.
  - Automatic deployments stay **enabled**. `git.deploymentEnabled: false` must not be
    reintroduced.
- **Framework:** `nestjs`, set in `vercel.json` so the setting is versioned and overrides an
  inherited "Other" preset.
- **Node.js:** 22.x, pinned by `.nvmrc` and `engines.node`.
- **Public base path:** `/api/v1`, produced by Nest's global prefix and URI versioning.

### 2. Repository layout

The Nest application lives at the repository root (`src/`, `dist/`) instead of `apps/api/`.

Reason: Vercel resolves the framework entry point relative to the project's Root Directory.
Keeping the app at the root means the existing Vercel project needs no Root Directory change,
no second `vercel.json`, and no wrapper entry point whose only job is to satisfy the builder's
import check. The pnpm workspace remains for `packages/contracts` and
`packages/simulation-core`.

```text
src/                     NestJS application (entry: src/main.ts)
packages/contracts/      @azmov7h/neuron-contracts
packages/simulation-core/@azmov7h/neuron-simulation-core
vercel.json              framework, install, and build configuration
```

### 3. Build contract

```json
{
  "framework": "nestjs",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm build"
}
```

`pnpm build` builds the workspace packages first and then runs `nest build` into `dist/`. The
build is reproducible because the lockfile is committed and the install is frozen. The Vercel
Node.js version comes from `engines.node`; the function bundle comes from the traced output of
`dist/main.js`, not from a committed artifact.

### 4. Health and observability

- `GET /api/v1/health` is a **liveness** probe: process up, version, commit, environment,
  uptime, timestamp. It is `no-store` and reveals no secrets.
- T04 adds **readiness** (MongoDB, Redis) once those clients exist, plus structured JSON logs
  with request IDs. Vercel's own function logs and Observability remain the platform-level
  source of truth.

### 5. Serverless constraints

These are architectural rules, not tuning knobs:

| Constraint | Consequence |
| --- | --- |
| One function, 250 MB bundle limit | Runtime dependencies stay lean; dev tooling and fixtures never enter `dependencies` |
| Invocation duration is bounded by the plan | Long work moves to Vercel Cron, Queues, or Workflows; no in-process schedulers |
| Instances are stateless and can be recycled | No local file writes, no in-memory job queues, no per-instance caches that must survive |
| Fluid compute reuses a warm instance concurrently | Shared clients must be safe for concurrent requests; bootstrap runs once per instance |
| MongoDB connections are expensive to open | T04 must cache one Mongo client across invocations and keep `maxPoolSize` small |
| SSE is supported but tied to the invocation | The legacy SSE routes must be re-checked against the function duration budget in T15/T16 |
| Preview and production are separate deployments | Every environment gets its own `CORS_ORIGINS` and, from T04, its own database credentials |
| `app.listen` is managed by Vercel | The entry calls it conventionally; no custom server, port, or TLS handling |

### 6. Configuration and secrets

- Project environment variables live in Vercel (Production, Preview, Development scopes).
- Repo-tracked configuration is limited to non-secret values: `vercel.json`, `.nvmrc`, and
  `engines`.
- `CORS_ORIGINS` is a comma-separated allowlist of frontend origins. It is validated at boot;
  invalid or non-HTTP values fail fast. An empty production allowlist boots with a warning and
  rejects browser cross-origin calls, which keeps `/health` reachable for diagnosis.
- `MONGODB_URI`, `JWT_SECRET`, `REDIS_URL`, and AI keys are T04 scope and exist only in Vercel's
  encrypted environment store. They are never written to `.env.example` with values.
- Workspace packages are linked with the workspace protocol. A `NODE_AUTH_TOKEN` with
  `read:packages` is only needed if the API later consumes `@azmov7h/*` from GitHub Packages
  instead of the workspace.

### 7. Rollback

- Platform: Vercel Instant Rollback to the previous deployment.
- Code: revert the offending commit on `main`; the GitHub integration redeploys.
- Behavior: the per-module cutover flag still selects legacy Next.js handlers during the soak
  window, so a rollback never requires a data rollback.

## Consequences

**Positive**

- The backend deploys from GitHub with no container registry, Dockerfile, or separate platform.
- Preview deployments give every PR a working API URL.
- The Nest preset handles compilation, tracing, and request routing.
- One app at the repository root removes the `apps/api` indirection and the extra Root Directory
  configuration.

**Negative / costs**

- Vercel Functions impose duration, bundle-size, and statelessness limits that a container did
  not.
- Local production parity depends on `vercel dev`, which downloads a builder on first run.
- Cold starts include Nest's dependency-injection bootstrap; T04 must keep module initialization
  lean.
- The database region must be chosen together with the function region to avoid cross-region
  latency.

**Risks**

- A dependency growth spurt pushes the function toward the 250 MB limit. Mitigation: keep
  runtime dependencies minimal, review the bundle after T04, and move build-only tooling to
  `devDependencies`.
- A long SSE stream exceeds the function duration. Mitigation: measure in T15; split or replace
  the stream with polling or a queue-backed channel if needed.
- Mongo connection exhaustion under concurrency. Mitigation: one cached client per instance with
  a bounded pool, and readiness checks that do not open a new connection per request.

## Alternatives considered

| Alternative | Why rejected |
| --- | --- |
| Container image (ADR-001 §7) | Explicitly rejected by the repository owner; adds a registry and a second hosting platform |
| Keep `apps/api` and set the Vercel Root Directory to `apps/api` | Works, but requires a dashboard-only setting, a second `vercel.json`, and keeps a single-app indirection |
| Root `api/index.js` adapter plus rewrites | Extra layer; the documented Nest preset already builds and routes the app, and rewrite path behavior is one more thing to verify |
| Vercel Services (`services` + rewrites) | Designed for multiple services; this repository has exactly one, and Services is still beta |
| Empty `public/` directory to silence the static build | Publishes an empty site and hides the misconfiguration |
| `git.deploymentEnabled: false` | Disables the GitHub-driven deployments the owner requires |

## Follow-ups

1. **T04:** cache the Mongo client across invocations, add readiness checks, validate the full
   environment contract, set an explicit function `maxDuration`, and co-locate the function
   region with MongoDB.
2. **T04:** add a Vercel Cron entry if any lifted module depended on an in-process scheduler.
3. **T02:** add workspace dependencies from the API to both packages and verify the frozen
   install still succeeds without registry credentials.
4. **T15/T16:** re-measure SSE and long-running endpoints against the function duration budget.
5. **T21:** remove the legacy Next.js handlers and point the frontend at the Vercel API domain.
