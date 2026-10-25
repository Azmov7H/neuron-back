# T01 — Workspace, tooling, and release pipeline

```text
Branch: chore/decouple-01-workspace (both repositories)
Base: chore/decouple-00-baseline (stacked; retarget to main after T00 merges)
Depends on: T00
Scope: create the pnpm workspace in neuron-back (apps/api, packages/contracts,
       packages/simulation-core), lint/format/typecheck/CI, Dependabot, and the GitHub Packages
       release workflow. In neuron, add NEXT_PUBLIC_API_BASE_URL support and the import-boundary
       guard. No Nest application, no business logic, no route changes.
Business logic: frozen. This task adds tooling and empty package surfaces only.
Parity: not applicable; no endpoint changes.
Performance: not applicable; no runtime code.
Security: CI uses a read-only GITHUB_TOKEN except the release job, which has packages: write.
          .npmrc contains the registry scope only, never a token. No secret is added to the repo.
Exit: both repositories build; pnpm verify is green; a packed tarball contains dist, package.json,
      and README; the frontend can target an external API base URL with same-origin default.
Rollback: revert this branch in both repositories. No runtime or data change.
```

## Backend half (`neuron-back`) — complete

| Area | Result |
| --- | --- |
| Workspace | `pnpm-workspace.yaml` with `apps/*` and `packages/*` |
| API slot | `apps/api` reserved, private, no runtime code (T04) |
| Contracts | `@azmov7h/neuron-contracts` builds to ESM + declarations |
| Simulation core | `@azmov7h/neuron-simulation-core` builds to ESM + declarations |
| Tooling | ESLint 10 flat config, Prettier 3, TypeScript 5.9 strict |
| CI | `.github/workflows/ci.yml`: format, lint, typecheck, test, build on Node 22 |
| Release | `.github/workflows/release.yml`: tag-driven publish to GitHub Packages |
| Dependencies | Dependabot for npm and GitHub Actions, weekly, majors ignored |
| Docs | `docs/packages.md`: versioning, release, consumption, local linking, failure modes |

### Evidence

```text
pnpm install                 OK  (pnpm 12.15.0)
pnpm format:check            OK
pnpm lint                    OK
pnpm typecheck               OK  (contracts, simulation-core)
pnpm test                    OK  (no test files yet)
pnpm build                   OK  (dist/index.js + .d.ts for both packages)
pnpm --filter ... pack       OK  (dist, package.json, README in the tarball)
```

### Version choice

The backend uses pnpm 12.15.0, the version installed on the development host. The frontend
stays on pnpm 10.15.0; the two repositories have independent lockfiles and CI. pnpm recursively
invokes itself for workspace scripts, so aligning `packageManager` with the host avoids a
version-guard failure inside `pnpm verify`.

## Frontend half (`neuron`) — in progress

Branch: `chore/decouple-01-workspace` in `neuron`, cut from `rd/ui-02/explore` after `5aa4c1e`
was pushed.

The frontend changes are:

1. `src/lib/api/client.ts`: prefix requests with `NEXT_PUBLIC_API_BASE_URL`, default `''`
   (same-origin), strip a trailing slash, and cover it with unit tests.
2. `scripts/check-backend-imports.mjs`: fail on new imports of `@/database`, `@/modules`,
   `@/lib/auth`, `@/lib/redis`, `@/lib/ai`, `@/config/env`, `@/middleware/auth`, or backend-only
   packages outside `app/api`. Warn mode with a committed 23-entry baseline until T16.
3. `.github/workflows/boundaries.yml`: runs the guard on pull requests with
   `continue-on-error: true`.
4. No raw `fetch` migration; SSE call sites move in T15/T16.

### Frontend evidence

```text
vitest run src/lib/api/__tests__/client.test.ts   8 passed
vitest run                                        180 passed (14 files)
tsc --noEmit                                      OK
eslint <changed files>                            OK
node scripts/check-backend-imports.mjs            23 baseline, 0 new
```

The guard was also tested with a temporary file importing `@/database/connection`; it reported
one new violation and exited 1.

## Exit gate

- [x] pnpm workspace and package skeletons
- [x] ESLint, Prettier, TypeScript, and strict configs
- [x] CI workflow green locally (`pnpm verify`)
- [x] Dependabot configuration
- [x] GitHub Packages release workflow and documentation
- [x] Package tarball verified
- [ ] Frontend `NEXT_PUBLIC_API_BASE_URL` support
- [ ] Frontend import-boundary guard
- [ ] Both repositories build in CI

The unchecked items are blocked on the frontend branch state, not on backend work.
