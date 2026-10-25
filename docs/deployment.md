# Deployment

- **Frontend (`Azmov7H/neuron`):** Vercel, existing project and root. Unchanged by the split.
- **Backend (`Azmov7H/neuron-back`):** Vercel Functions, NestJS preset, deployed from GitHub.
  Decision and constraints: [ADR-002](adr/0002-vercel-serverless-hosting.md).

## One-time Vercel project setup

The repository already contains `vercel.json`, so only the GitHub connection and environment
variables need attention.

| Setting | Value |
| --- | --- |
| Git repository | `Azmov7H/neuron-back` |
| Production branch | `main` |
| Root Directory | repository root (do not select a subdirectory) |
| Framework Preset | `nestjs` — also forced by `vercel.json` |
| Install Command | `pnpm install --frozen-lockfile` (from `vercel.json`) |
| Build Command | `pnpm build` (from `vercel.json`) |
| Node.js Version | 22.x (from `.nvmrc` and `engines.node`) |

Automatic deployments must stay enabled: pushes to `main` deploy production, pull requests
deploy previews. Do **not** add `git.deploymentEnabled: false`; that setting stops the
GitHub-driven deployments the backend depends on.

### Environment variables

| Variable | Scope | Required now |
| --- | --- | --- |
| `CORS_ORIGINS` | Production, Preview | Recommended; comma-separated frontend origins |
| `MONGODB_URI`, `MONGODB_DB_NAME` | Production, Preview | T04 |
| `JWT_SECRET`, `REFRESH_TOKEN_SECRET` | Production, Preview | T04 |
| `REDIS_URL` | Production, Preview | T04 |
| `OPENAI_API_KEY`, `OPENROUTER_API_KEY` | Production, Preview | T04 |
| `NODE_AUTH_TOKEN` (`read:packages`) | Build scope | Only if `@azmov7h/*` is consumed from GitHub Packages instead of the workspace |

Example production value:

```text
CORS_ORIGINS=https://neuron.example.com
```

Preview deployments should use the preview frontend origin, not the production origin, so
cookies and CORS remain separable. Secrets are entered in Vercel and never committed.

## Verify a deployment

```bash
curl -fsS https://<deployment-domain>/api/v1/health
```

Expected shape:

```json
{
  "status": "ok",
  "service": "neuron-api",
  "version": "0.0.0",
  "commit": "abc1234",
  "environment": "production",
  "uptimeSeconds": 12,
  "timestamp": "2026-10-25T01:00:00.000Z"
}
```

`commit` is populated from `VERCEL_GIT_COMMIT_SHA`; `environment` from `VERCEL_ENV`. The response
is `Cache-Control: no-store`, carries Helmet's security headers, and includes CORS headers only
for allowlisted origins.

### Preview deployment protection

New Vercel projects enable **Deployment Protection** for preview deployments, so
`curl https://<branch-alias>.vercel.app/api/v1/health` returns a `302` to Vercel SSO instead of
the API. That is expected and does not mean the function failed to build.

To let a frontend preview call the API preview, either:

- add a [Protection Bypass for Automation](https://vercel.com/docs/deployment-protection#protection-bypass-for-automation)
  secret and send `x-vercel-protection-bypass` plus `x-vercel-set-bypass-cookie` from the
  frontend server, or
- disable Deployment Protection for the project in **Settings → Deployment Protection**.

Production deployments are not protected by the default "Standard Protection" setting. Do not
disable protection for production just to test a preview.

## Local production parity

```bash
pnpm install
pnpm verify                 # format, lint, typecheck, build, HTTP tests
vercel dev -L               # Vercel's builder, no account link required
```

`vercel dev -L` uses the same Nest framework builder as a real deployment. The first run
downloads `@vercel/nestjs` and the first request may take several seconds while the function is
compiled. It listens on `http://localhost:3000` by default.

Plain local development does not need Vercel:

```bash
pnpm dev                    # nest start --watch
curl http://localhost:3000/api/v1/health
```

## Why the old build failed

The first Vercel deployment treated the repository as a static site:

```text
Error: [STATIC_BUILD_NO_OUT_DIR] No Output Directory named "public" found after the Build completed.
```

That was a framework-preset problem, not a missing directory. `vercel.json` now selects the
`nestjs` preset, and `src/main.ts` imports `NestFactory` directly so the builder can prove the
entry point is a Nest application. Do not add an empty `public/` directory.

If a build fails with:

```text
Error: No entrypoint found which imports nestjs. Found possible entrypoint: src/main.ts
```

the entry file does not import a Nest package. `src/main.ts` must import from `@nestjs/core` (or
another `@nestjs/*` package) directly; re-exporting a bootstrap helper is not enough.

## Runtime limits

Vercel Functions are stateless and bounded. These rules apply from the first API module:

- No local filesystem writes and no in-memory queues.
- No in-process schedulers; use Vercel Cron/Queues/Workflows.
- Cache the MongoDB client across invocations (T04) and keep the pool small.
- Keep runtime dependencies lean; the function bundle limit is 250 MB.
- Treat SSE and other long-lived responses as bounded by the function duration; re-measure them
  in T15/T16.
- Keep bootstrap work small; Fluid compute reuses warm instances but cold starts pay Nest's
  dependency-injection cost.

## Migration-time environment overlap

During the migration the frontend still runs the legacy Next.js route handlers, so it
temporarily keeps its backend variables. T21 removes them when the legacy handlers are deleted.

| Variable | Frontend | Backend |
| --- | :---: | :---: |
| `NEXT_PUBLIC_API_BASE_URL` | yes | no |
| `MONGODB_URI`, `MONGODB_DB_NAME` | temporary | yes |
| `JWT_SECRET`, `REFRESH_TOKEN_SECRET` | temporary | yes |
| `REDIS_URL` | temporary | yes |
| `OPENAI_API_KEY`, `OPENROUTER_API_KEY` | temporary | yes |
| `CORS_ORIGINS` | no | yes |
| `DASHBOARD_SECRET` | temporary | removed with the endpoint in T09 |

## Rollback

- **Frontend:** Vercel Instant Rollback to the previous deployment.
- **Backend:** Vercel Instant Rollback, or revert the commit on `main` and let GitHub redeploy.
- **Behavior:** flip the affected module's cutover flag back to the legacy Next.js handler. No
  database rollback is required.
