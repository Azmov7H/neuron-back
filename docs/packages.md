# Shared packages: versioning and release

Both shared packages are published to **GitHub Packages** and consumed by the Next.js
application with a pinned version.

| Package                           | Tag prefix           | Registry                     |
| --------------------------------- | -------------------- | ---------------------------- |
| `@azmov7h/neuron-contracts`       | `contracts-v*`       | `https://npm.pkg.github.com` |
| `@azmov7h/neuron-simulation-core` | `simulation-core-v*` | `https://npm.pkg.github.com` |

The scope must match the GitHub owner (`@azmov7h`) because GitHub Packages requires it.

## Contents

`@azmov7h/neuron-contracts`

- response envelope and error codes (`AppError`, `ERROR_CODES`)
- roles and RBAC hierarchy
- `/api/v1` route constants, including encoded dynamic builders
- auth cookie/CSRF/JWT transport constants and DTOs
- cross-cutting DTOs (dashboard, navigation, notifications, dock, simulation history)
- pure Zod schemas for auth, profile, neural paths, spark, discovery, cognitive, knowledge

`@azmov7h/neuron-simulation-core`

- the 48-simulation registry and canonical domain/parameter types
- NL interpretation schemas and the pure resolver/prompt builders
- audit, deterministic fallback, snapshot sanitization, equation presentation
- Lotka–Volterra integration, simulation state classification, history-limit guard
- the simulation config wire builder and simulation-run request schemas

Neither package may import Mongoose, Next.js, NestJS, or read environment variables.

## Versioning

- `0.x` while the migration is in progress.
- Pre-releases use `0.x.y-dev.<short-sha>` and are published manually for cross-repository
  testing. They are never referenced from `main`.
- Breaking changes require a major bump and a parity allowlist entry in the frontend.
- `contracts` and `simulation-core` are versioned independently.

## Release procedure

1. Update the package version without creating a git tag:
   ```bash
   pnpm --filter @azmov7h/neuron-contracts version patch --no-git-tag-version
   ```
2. Run the full verification:
   ```bash
   pnpm verify
   ```
3. Commit the version bump and tag it:
   ```bash
   git add packages/contracts/package.json pnpm-lock.yaml
   git commit -m "chore(release): @azmov7h/neuron-contracts v0.1.0"
   git tag contracts-v0.1.0
   git push origin main --tags
   ```
4. The `release` workflow verifies that the tag version matches `package.json`, builds, and
   publishes with `GITHUB_TOKEN`.

## Consuming from the frontend

`neuron/.npmrc`:

```ini
@azmov7h:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` must be a GitHub token with `read:packages` locally and in Vercel. Never
commit the token.

```bash
pnpm add @azmov7h/neuron-contracts@0.1.0 @azmov7h/neuron-simulation-core@0.1.0
```

Pin exact versions (no `^`) until the migration is complete, so a package release can never
change the frontend without a reviewed dependency bump.

## Local cross-repository development

Before a release exists, link the workspace package into the frontend:

```bash
# in neuron-back
pnpm --filter @azmov7h/neuron-simulation-core build
cd packages/simulation-core && pnpm link --global

# in neuron
pnpm link --global @azmov7h/neuron-simulation-core
```

Remove the link before committing. CI always installs from the registry, so a broken release
cannot hide behind a local link.

## Failure modes

| Symptom                                 | Cause                                                                   | Fix                                        |
| --------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------ |
| `401 Unauthorized` during install       | Missing or expired `NODE_AUTH_TOKEN`                                    | Re-authenticate with `read:packages`       |
| `404 Not Found` for a published version | Wrong scope, wrong registry, or the package is not visible to the token | Check `.npmrc` and package visibility      |
| Tag push does not publish               | Tag prefix does not match the workflow                                  | Use `contracts-v*` or `simulation-core-v*` |
| Version mismatch error in CI            | Tag and `package.json` disagree                                         | Bump the package, commit, retag            |
