# T02 — Contracts and simulation core

- **Branch:** `feat/decouple-02-contracts`
- **Base:** `main` (`6c06705`, after T01 Vercel deploy merged)
- **Depends on:** T01
- **Scope:** populate the two shared packages with the pure, framework-free contracts and
  simulation logic currently trapped in the Next.js app. No NestJS domain module is ported here,
  no MongoDB model is created, and the frontend is not modified.
- **Business logic:** lifted, not rewritten. Registry order, IDs, parameter bounds, validation
  messages, NL resolution order, deterministic fallback strings, history limit clamping, and
  the response envelope are frozen.
- **Exit gate:** `pnpm verify` green on Node 22; both packages build to ESM + `.d.ts` and can be
  imported from plain Node; package tests cover every lifted module.

## What moved

### `@azmov7h/neuron-simulation-core`

| Module                    | Source (frontend)                                      | Change                                                                 |
| ------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `registry.types.ts`       | `src/lib/simulation/registry.types.ts`                 | verbatim                                                                |
| `registry.ts`             | `src/lib/simulation/registry.ts`                       | verbatim (48 simulations, module-level initialization preserved)        |
| `schemas.ts`              | `src/lib/simulation/schemas.ts`                        | verbatim                                                                |
| `assessment.contract.ts`  | `src/lib/simulation/assessment.contract.ts`            | verbatim                                                                |
| `deterministic-fallback.ts` | `src/lib/simulation/deterministic-fallback.ts`       | import retargeted from `./assessment` to `./assessment.contract`        |
| `audit.ts`                | `src/lib/simulation/audit.ts`                          | verbatim                                                                |
| `fallback-interpreter.ts` | `src/lib/simulation/fallback-interpreter.ts`           | verbatim                                                                |
| `lotka-volterra.ts`       | `src/lib/simulation/lotka-volterra.ts`                 | verbatim                                                                |
| `snapshot-sanitize.ts`    | `src/lib/simulation/snapshot-sanitize.ts`              | verbatim                                                                |
| `equation-presentation.ts`| `src/lib/simulation/equation-presentation.ts`          | verbatim                                                                |
| `history-params.ts`       | `src/lib/simulation/history-params.ts`                 | pure half only (`parseHistoryLimit` + limits); Mongoose builder stays server-side |
| `simulation.types.ts`     | `components/simulation-runner/simulation.types.ts`     | verbatim                                                                |
| `simulation-state.ts`     | `components/simulation-runner/simulation-state.ts`     | import retargeted to package-local registry                            |
| `nl-interpreter.ts`       | `src/lib/simulation/nl-interpreter.service.ts`         | pure resolver/prompts extracted; LLM provider class stays backend       |
| `config-payload.ts`       | `src/lib/simulation/config-payload.ts`                 | UI styles injected; `SIMULATION_DOMAIN_STYLES` carries the exact wire values |
| `simulation-run.ts`       | `src/lib/security/validation.ts`                       | verbatim schemas; error now carries `cause`                             |

Deliberately **not** moved:

- `getConfiguredAiModel` and the `NaturalLanguageInterpreter` provider loop (env, network, timeout).
- `buildHistoryQuery` (Mongoose + authenticated user id).
- `buildSimulationConfigPayload` UI adapter in `components/` (icons, Tailwind-only tokens).
- Next.js API routes, CSRF middleware, rate limiting, logging.
- The simulation engine itself (`components/simulation-runner/simulation-engine.ts`) and its
  jsdom test. T02 shares the contracts the engine consumes, not the engine.

### `@azmov7h/neuron-contracts`

| Area                | Contents                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Envelope            | `ApiResponse`, `PaginatedResponse`, `success`, `created`, `paginated`, `failure`, 422 field map, Zod issue mapper |
| Errors              | `AppError` and 46 frozen legacy error codes                                               |
| Roles               | `Role`, `ROLES`, `ROLE_HIERARCHY`, `hasMinimumRole`                                       |
| Routes              | `/api/v1` prefix and every legacy path (static + encoded dynamic builders)                |
| Auth transport      | Cookie/CSRF names, CSRF TTL, JWT algorithm, JWT/token/request/user DTOs                   |
| DTOs                | dashboard summary/secret, navigation, notifications, dock, simulation history/config/run request |
| Schemas             | auth, profile, neural paths, spark, discovery, recommendations, cognitive, memory, timeline, graph, analytics, bookmarks |
| Knowledge schemas   | the full Scientific Knowledge Engine create/update/search/format schema set                |
| Knowledge vocabulary| 18-domain taxonomy (`KnowledgeDomain`), relationship/media/source/era enums                |

The six lab domains (`ScientificDomain` in simulation-core) and the 18 knowledge domains are
distinct concepts and are exported under distinct names to prevent accidental mixing.

Deliberately **not** moved: Mongoose document interfaces, `Types.ObjectId`, Next.js request /
response types, rate-limit stores, Redis, AI providers, and any module that reads `process.env`.

## Behavior guarantees

- `INTERACTIVE_SIM_IDS` is a single exported array; `DOMAIN_ORDER === SCIENTIFIC_DOMAINS`.
- Registry insertion order is unchanged: 6 domains × 8 simulations = 48.
- `clampSimulationParameters` still returns the same unknown-simulation object reference.
- `sanitizeSnapshot` still passes arrays through by reference.
- `parseHistoryLimit` keeps `Number()` + `Math.floor` + clamp semantics.
- `resolveNlProposal` keeps the exact pipeline order and the empty-sanitized-params
  `needs_input` rule. Logging is injected and defaults to a no-op, so the package has no logger.
- Deterministic fallback strings, model label, and fallback reasons are byte-identical.
- The config payload emits the same domain order and the same presentation values as before.
- `SimulationRunCreateSchema` still Title-Cases the incoming domain (legacy persisted form).
- The response envelope keeps the legacy quirk where an `AppError` code appears in the
  top-level `message` field.

## Package mechanics

- ESM-only (`"type": "module"`), one module instance per process — no dual CJS/ESM build.
- Per-package `tsconfig` uses `NodeNext`; every relative import is emitted with a `.js`
  extension so the built package runs in plain Node and in any bundler.
- `zod ^4.4.3` is a real dependency of both packages, matching the frontend.
- `vitest` runs the TypeScript sources directly; `pnpm test` aggregates package tests and the
  compiled HTTP tests.

## Evidence

```
Node v22.23.2
pnpm verify
  format:check  pass
  eslint        pass
  typecheck     pass (both packages + Nest app)
  build         pass (both packages + Nest app)
  test          contracts:        4 files,  23 tests pass
                simulation-core: 14 files, 141 tests pass
                compiled HTTP:    5 tests pass
```

Test movement:

- 12 frontend simulation test files were moved; 11 run with only import-path adaptation.
- `nl-interpreter.test.ts` keeps the pure resolver cases and replaces the provider-class cases
  with `fallbackInterpret → resolveNlProposal` pipeline cases.
- `history-params.test.ts` keeps limit clamping in the package. `buildHistoryQuery` ownership
  tests move with the Mongoose adapter in T04.
- `assessment.test.ts` drops the env-dependent `getConfiguredAiModel` case (covered when the
  backend assessment service lands) and pins the deterministic model label instead.
- A new `package-surface.test.ts` locks export identity, classification counts, and the config
  wire shape.
- A boundary guard in each package fails if `src/` ever imports Mongoose, Next.js, a path alias,
  or reads `process.env`.

Smoke import of the built output:

```
core 48 17 6 100        # registry size, interactive ids, config domains, clamped limit
contracts /api/v1/auth/login true 4
domain normalizes to Physics
```

## Follow-ups (not T02)

1. Publish `0.1.0` prereleases and adopt the packages in the frontend on a separate branch;
   do not touch the user's three WIP simulation files.
2. Backend adapters: `NaturalLanguageInterpreter` with logger injection,
   `buildHistoryQuery`, assessment service.
3. Nest common layer (T03) should import `AppError`, `ERROR_CODES`, and the envelope builders
   rather than re-declaring them.
4. Add `x-csrf-token` to CORS `allowedHeaders` when the CSRF guard lands (T04/T05).
5. Decide whether the 18-domain knowledge vocabulary belongs in contracts or a future
   knowledge package; it is here now because route schemas need it.
