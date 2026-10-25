# `@azmov7h/neuron-simulation-core`

Pure simulation logic shared by the browser engine and the server-side assessment. One source
of truth for registry entries, schemas, sanitizers, and math.

**Owned by:** backend. **Consumed by:** both applications.

## Contents (T02)

- Simulation registry and registry types
- Zod schemas for parameters and snapshots
- Snapshot sanitizers
- Deterministic math and fallback formulas
- Clamping rules and limits

## Rules

- No `next`, `react`, `mongoose`, Nest, Redis, or AI SDK imports.
- No `process.env` access and no Node-only APIs. The package must run unchanged in the browser.
- No database, HTTP, logging, or telemetry side effects.
- Deterministic: the same input always produces the same output.
- The existing simulation tests are the acceptance suite. Moving the code must not change a
  single assertion.

## Build

```bash
pnpm --filter @azmov7h/neuron-simulation-core build
pnpm --filter @azmov7h/neuron-simulation-core typecheck
pnpm --filter @azmov7h/neuron-simulation-core test
```

## Release

See `docs/packages.md`. Versions are published to GitHub Packages from a `simulation-core-v*`
tag.
