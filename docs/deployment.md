# Deployment boundaries

- **Frontend (`neuron`):** Vercel, existing project and root. Unchanged by the split.
- **Backend (`neuron-back`):** container image, deployed independently. Defined in T04.

## `neuron-back` is not a Vercel static site

A Vercel project pointed at `neuron-back` fails with:

```text
Error: [STATIC_BUILD_NO_OUT_DIR] No Output Directory named "public" found after the Build completed.
```

The repository contains a pnpm workspace and, from T04, a NestJS server. It does not produce a
static `public/` directory, and it must not be deployed as one.

### If a Vercel project exists for this repository

Choose one:

1. **Recommended:** delete or disconnect the Vercel project. The API is deployed as a container
   in T04, behind `/api/v1`, with `/api/v1/health` as the readiness probe.
2. **Only if the API must run on Vercel:** treat it as a serverless Node project, not a static
   one. That requires a dedicated adapter, a `vercel.json`, connection pooling for MongoDB, and
   an explicit decision to abandon the container plan. This is out of scope for T04 and needs
   an ADR.

Do not add an empty `public/` directory to silence the error. It would publish an empty site and
hide a real configuration problem.

### Automatic deployments are disabled

`vercel.json` sets `git.deploymentEnabled` to `false`. This keeps the GitHub integration
connected for PR comments and metadata but stops Vercel from building every push as a static
site:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

Remove that setting only after the project is intentionally configured for the API (container
or serverless, decided in T04). Deleting the Vercel project is also safe; the file is harmless
without one.

## Environment separation

| Variable                                   | Frontend | Backend |
| ------------------------------------------ | :------: | :-----: |
| `NEXT_PUBLIC_API_BASE_URL`                 |   yes    |   no    |
| `MONGODB_URI`, `MONGODB_DB_NAME`           |    no    |   yes   |
| `JWT_SECRET`, `REFRESH_TOKEN_SECRET`       |    no    |   yes   |
| `REDIS_URL`                                |    no    |   yes   |
| `OPENAI_API_KEY`, `OPENROUTER_API_KEY`     |    no    |   yes   |
| `DASHBOARD_SECRET`                         |    no    | removed with the endpoint in T09 |

During the migration the frontend still runs the legacy Next route handlers, so it temporarily
keeps the backend variables. T21 removes them when the legacy routes are deleted.

## Rollback

- Frontend: Vercel instant rollback to the previous deployment.
- Backend: redeploy the previous container image.
- Cutover: flip the module flag back to the legacy route handlers; no database rollback.
