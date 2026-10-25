# `@azmov7h/api`

The NestJS application lives here starting in T04.

This package is private and is never published. T01 only reserves the workspace slot; bootstrapping,
configuration, database connection, health checks, and the API modules are T04's scope.

Planned layout (T04):

```text
src/
  main.ts
  app.module.ts
  common/        guards, filters, interceptors, pipes, decorators
  config/        validated environment
  database/      connection, schemas, indexes, seeds
  modules/       auth, users, knowledge, explore, evolution, neural-paths,
                 cognitive, simulations, spark, recommendations, dashboard,
                 navigation, health
  shared/        cache, AI providers, events, audit, logger
test/            e2e, contract, parity fixtures
```
