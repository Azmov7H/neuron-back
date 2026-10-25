# T01 — Vercel deployment for the NestJS API

```text
Branch: chore/decouple-01-vercel-deploy
Base: main
Depends on: T01 workspace scaffold
Supersedes: chore/decouple-01-disable-vercel-deploys (reverts the deployment freeze)
Scope: make the backend deployable to Vercel from GitHub. Add the NestJS runtime skeleton,
       the Vercel framework configuration, and the deployment documentation. No domain logic,
       no MongoDB, no route migration.
Business logic: frozen. Only /api/v1 and /api/v1/health exist.
Parity: not applicable; no legacy route is replaced.
Performance: one function, warm-instance reuse, Helmet and CORS on every response.
Security: no secret is committed; CORS is an explicit allowlist with credentials; no
          x-powered-by header; health exposes no internal details.
Exit: pnpm verify is green; vercel dev -L serves /api/v1/health with the Nest builder;
      the repository has no deployment-disabling configuration.
Rollback: revert this branch. The Vercel project falls back to an earlier deployment; no
          data changes.
```

## Why this task exists

ADR-001 planned a container deployment. The repository owner requires Vercel with the GitHub
integration instead. ADR-002 records the new decision and its constraints. This task implements
the minimum runtime needed to prove the deployment path before T04 adds business modules.

## What changed

| Area | Change |
| --- | --- |
| Layout | Nest application moved from the reserved `apps/api/` slot to the repository root (`src/`) |
| Workspace | `pnpm-workspace.yaml` now contains only `packages/*` |
| Entry | `src/main.ts` imports `NestFactory` directly so the Vercel Nest builder detects it |
| Policy | `src/app.setup.ts` applies Helmet, proxy trust, `/api` prefix, URI v1, and CORS allowlist |
| Config | `src/config/env.ts` validates `CORS_ORIGINS`, fails fast on invalid values, warns on empty production allowlist |
| Health | `GET /api/v1/health` (liveness) and `GET /api/v1` (service descriptor) |
| Build | `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`; `pnpm build` builds packages then `nest build` |
| Deployment | `vercel.json` selects the `nestjs` preset, frozen install, and `pnpm build` |
| Tests | `test/health.test.mjs` boots the compiled app and checks health, CORS, headers, and 404s |
| Docs | ADR-002, ADR-001 §7 amendment, rewritten `docs/deployment.md`, README layout/status |

## Evidence

```text
pnpm build         OK   packages + dist/main.js
pnpm test          OK   5/5 HTTP tests
pnpm typecheck     OK
pnpm lint          OK
pnpm format:check  OK
vercel dev -L      OK   Nest builder compiled the entry and served:
                        GET /api/v1/health -> 200 JSON
                        GET /api/v1        -> 200 JSON
GitHub status      OK   Vercel: "Deployment has completed" for 6327d74
```

The preview deployment exists at the branch alias and is guarded by Vercel's default
Deployment Protection (SSO redirect), which is expected for preview environments. Production is
verified after merge.

`vercel dev -L` output confirmed the framework builder, not a hand-written adapter:

```text
> Installing Builder: @vercel/nestjs@latest
> Ready! Available at http://127.0.0.1:3456
[Nest] ... AppModule dependencies initialized
[Nest] ... Mapped {/api, GET} (version: 1) route
[Nest] ... Mapped {/api/health, GET} (version: 1) route
```

The first attempt failed with `No entrypoint found which imports nestjs` because `src/main.ts`
only re-exported a bootstrap helper. Importing `NestFactory` in the entry fixed detection. This
is recorded in ADR-002 and in the deployment troubleshooting section.

## Exit gate

- [x] Nest application builds to `dist/main.js`
- [x] HTTP tests cover health, CORS allow/deny, security headers, and 404 JSON
- [x] Vercel Nest builder serves the app locally
- [x] Preview deployment built by Vercel from GitHub
- [x] No `git.deploymentEnabled: false` remains
- [x] Deployment, environment, and rollback steps documented
- [ ] Production deployment verified after the branch merges (requires the Vercel project link)
- [ ] `CORS_ORIGINS` set for the frontend production origin
