# `@azmov7h/neuron-contracts`

Single source of truth for the HTTP contract between `neuron` (Next.js) and `neuron-back`
(NestJS).

**Owned by:** backend. **Consumed by:** both applications.

## Contents (T02)

- Request and response DTOs
- Zod schemas used by the Nest validation pipe and by frontend form validation
- The standard response envelope and error codes
- Role names and the role hierarchy
- Route constants and the API version prefix

## Rules

- No `next`, `react`, `mongoose`, Nest, Redis, or AI SDK imports.
- No `process.env` access and no Node-only APIs.
- No side effects at import time.
- Every exported schema is the runtime validator and the TypeScript source of truth.
- Breaking changes require a major version and a parity allowlist entry.

## Build

```bash
pnpm --filter @azmov7h/neuron-contracts build
pnpm --filter @azmov7h/neuron-contracts typecheck
pnpm --filter @azmov7h/neuron-contracts test
```

## Release

See `docs/packages.md`. Versions are published to GitHub Packages from a `contracts-v*` tag.
