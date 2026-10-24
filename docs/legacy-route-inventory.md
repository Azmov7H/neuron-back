# Legacy API Route Inventory

> Generated file — do not edit by hand. Regenerate with `node scripts/inventory-legacy-routes.mjs --frontend <path>`.

## Source

- Frontend directory: `../neuron`
- Frontend commit: `5aa4c1e228f286c779fc419110d772663766fa79`
- Frontend branch: `rd/ui-02/explore`
- Generated at: `2026-10-24T23:55:43.240Z`
- Route handler files: **85**
- HTTP operations: **124**
- Routes referenced by UI code: **67**
- Routes with no UI reference: **18**

## Summary by domain

| Domain | Route files | Operations | Public ops | SSE ops | Rate limited | CSRF |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `action` | 1 | 1 | 0 | 0 | 0 | 0 |
| `auth` | 5 | 5 | 5 | 0 | 2 | 4 |
| `cognitive` | 10 | 17 | 0 | 0 | 0 | 0 |
| `dashboard` | 2 | 2 | 0 | 0 | 0 | 0 |
| `dock` | 1 | 1 | 0 | 0 | 0 | 0 |
| `evolution` | 6 | 6 | 1 | 0 | 0 | 0 |
| `explore` | 6 | 7 | 0 | 0 | 0 | 0 |
| `health` | 1 | 1 | 1 | 0 | 0 | 0 |
| `knowledge` | 35 | 66 | 0 | 0 | 0 | 0 |
| `navigation` | 1 | 1 | 0 | 0 | 0 | 0 |
| `neural-paths` | 5 | 5 | 0 | 0 | 0 | 0 |
| `notifications` | 1 | 1 | 0 | 0 | 0 | 0 |
| `recommendations` | 2 | 2 | 0 | 0 | 0 | 0 |
| `simulations` | 4 | 4 | 1 | 1 | 2 | 2 |
| `spark` | 4 | 4 | 0 | 1 | 0 | 0 |
| `users` | 1 | 1 | 0 | 0 | 0 | 0 |
| **Total** | **85** | **124** | **8** | **2** | **4** | **6** |

Column notes:

- **Auth** — `session` requires a valid access token; `role:<role>` requires the named RBAC role; `public` has no auth wrapper.
- **Consumers** — number of non-API source files that reference the path. A zero count is a candidate for deprecation, not an automatic removal.
- **Models** — Mongoose modules imported directly by the handler. A dash means the handler delegates to a service.
- **Modules** — backend service modules imported by the handler. This is the ownership unit for the Nest port.

### `action` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `POST` | `/api/action` | session | no | no | no | — | — | 0 | `app/api/action/route.ts` |

### `auth` (5 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/auth/csrf` | public | no | no | no | — | — | 5 | `app/api/auth/csrf/route.ts` |
| `POST` | `/api/auth/login` | public | yes | yes | no | — | `auth` | 1 | `app/api/auth/login/route.ts` |
| `POST` | `/api/auth/refresh` | public | yes | no | no | — | `auth` | 0 | `app/api/auth/refresh/route.ts` |
| `POST` | `/api/auth/register` | public | yes | yes | no | — | `auth` | 1 | `app/api/auth/register/route.ts` |
| `DELETE` | `/api/auth/session` | public | yes | no | no | — | — | 3 | `app/api/auth/session/route.ts` |

### `cognitive` (10 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/cognitive/context` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/context/route.ts` |
| `POST` | `/api/cognitive/context` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/context/route.ts` |
| `GET` | `/api/cognitive/discoveries` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/discoveries/route.ts` |
| `POST` | `/api/cognitive/discoveries` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/discoveries/route.ts` |
| `GET` | `/api/cognitive/graph` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/graph/route.ts` |
| `POST` | `/api/cognitive/graph/nodes` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/graph/nodes/route.ts` |
| `GET` | `/api/cognitive/graph/nodes/[id]` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/graph/nodes/[id]/route.ts` |
| `GET` | `/api/cognitive/graph/nodes/[id]/related` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/graph/nodes/[id]/related/route.ts` |
| `POST` | `/api/cognitive/graph/nodes/edge` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/graph/nodes/edge/route.ts` |
| `GET` | `/api/cognitive/memory` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/memory/route.ts` |
| `POST` | `/api/cognitive/memory` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/memory/route.ts` |
| `PUT` | `/api/cognitive/memory` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/memory/route.ts` |
| `GET` | `/api/cognitive/profile` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/profile/route.ts` |
| `POST` | `/api/cognitive/profile` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/profile/route.ts` |
| `PUT` | `/api/cognitive/profile` | session | no | no | no | — | `cognitive-engine` | 1 | `app/api/cognitive/profile/route.ts` |
| `GET` | `/api/cognitive/recommendations` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/recommendations/route.ts` |
| `POST` | `/api/cognitive/recommendations` | session | no | no | no | — | `cognitive-engine` | 0 | `app/api/cognitive/recommendations/route.ts` |

### `dashboard` (2 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/dashboard/secret` | session | no | no | no | — | — | 1 | `app/api/dashboard/secret/route.ts` |
| `GET` | `/api/dashboard/summary` | session | no | no | no | `discovery`, `neural-path`, `user`, `user-progress` | — | 1 | `app/api/dashboard/summary/route.ts` |

### `dock` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/dock` | session | no | no | no | `simulation-run` | — | 1 | `app/api/dock/route.ts` |

### `evolution` (6 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `POST` | `/api/evolution/add-xp` | session | no | no | no | — | `evolution` | 0 | `app/api/evolution/add-xp/route.ts` |
| `GET` | `/api/evolution/leaderboard` | public | no | no | no | — | `evolution` | 0 | `app/api/evolution/leaderboard/route.ts` |
| `GET` | `/api/evolution/logs` | session | no | no | no | — | `evolution` | 1 | `app/api/evolution/logs/route.ts` |
| `GET` | `/api/evolution/me` | session | no | no | no | — | `evolution` | 1 | `app/api/evolution/me/route.ts` |
| `GET` | `/api/evolution/stats` | session | no | no | no | — | `evolution` | 0 | `app/api/evolution/stats/route.ts` |
| `POST` | `/api/evolution/streak` | session | no | no | no | — | `evolution` | 0 | `app/api/evolution/streak/route.ts` |

### `explore` (6 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/explore/activity` | session | no | no | no | — | `explore` | 1 | `app/api/explore/activity/route.ts` |
| `POST` | `/api/explore/activity` | session | no | no | no | — | `explore` | 1 | `app/api/explore/activity/route.ts` |
| `GET` | `/api/explore/concepts` | session | no | no | no | — | `explore` | 0 | `app/api/explore/concepts/route.ts` |
| `GET` | `/api/explore/domains` | session | no | no | no | — | `explore` | 1 | `app/api/explore/domains/route.ts` |
| `GET` | `/api/explore/navigation` | session | no | no | no | — | `explore` | 1 | `app/api/explore/navigation/route.ts` |
| `GET` | `/api/explore/recommendations` | session | no | no | no | — | `explore` | 0 | `app/api/explore/recommendations/route.ts` |
| `GET` | `/api/explore/trending` | session | no | no | no | — | `explore` | 1 | `app/api/explore/trending/route.ts` |

### `health` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/health` | public | no | no | no | — | — | 0 | `app/api/health/route.ts` |

### `knowledge` (35 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/knowledge/citations` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/citations/route.ts` |
| `POST` | `/api/knowledge/citations` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/citations/route.ts` |
| `GET` | `/api/knowledge/citations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/citations/[id]/route.ts` |
| `PUT` | `/api/knowledge/citations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/citations/[id]/route.ts` |
| `DELETE` | `/api/knowledge/citations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/citations/[id]/route.ts` |
| `GET` | `/api/knowledge/citations/[id]/format` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/citations/[id]/format/route.ts` |
| `GET` | `/api/knowledge/concepts` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/route.ts` |
| `POST` | `/api/knowledge/concepts` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/route.ts` |
| `GET` | `/api/knowledge/concepts/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/route.ts` |
| `PUT` | `/api/knowledge/concepts/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/route.ts` |
| `DELETE` | `/api/knowledge/concepts/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/route.ts` |
| `POST` | `/api/knowledge/concepts/[slug]/publish` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/publish/route.ts` |
| `POST` | `/api/knowledge/concepts/[slug]/rate` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/rate/route.ts` |
| `GET` | `/api/knowledge/concepts/[slug]/relationships` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/relationships/route.ts` |
| `GET` | `/api/knowledge/concepts/[slug]/traverse` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/concepts/[slug]/traverse/route.ts` |
| `GET` | `/api/knowledge/domains` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/domains/route.ts` |
| `POST` | `/api/knowledge/domains` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/domains/route.ts` |
| `GET` | `/api/knowledge/encyclopedia` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/encyclopedia/route.ts` |
| `POST` | `/api/knowledge/encyclopedia` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/encyclopedia/route.ts` |
| `GET` | `/api/knowledge/encyclopedia/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/encyclopedia/[slug]/route.ts` |
| `PUT` | `/api/knowledge/encyclopedia/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/encyclopedia/[slug]/route.ts` |
| `DELETE` | `/api/knowledge/encyclopedia/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/encyclopedia/[slug]/route.ts` |
| `GET` | `/api/knowledge/encyclopedia/featured` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/encyclopedia/featured/route.ts` |
| `GET` | `/api/knowledge/equations` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/equations/route.ts` |
| `POST` | `/api/knowledge/equations` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/equations/route.ts` |
| `GET` | `/api/knowledge/equations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/equations/[id]/route.ts` |
| `PUT` | `/api/knowledge/equations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/equations/[id]/route.ts` |
| `DELETE` | `/api/knowledge/equations/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/equations/[id]/route.ts` |
| `GET` | `/api/knowledge/equations/solvable` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/equations/solvable/route.ts` |
| `GET` | `/api/knowledge/experiments` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/experiments/route.ts` |
| `POST` | `/api/knowledge/experiments` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/experiments/route.ts` |
| `GET` | `/api/knowledge/experiments/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/experiments/[slug]/route.ts` |
| `PUT` | `/api/knowledge/experiments/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/experiments/[slug]/route.ts` |
| `DELETE` | `/api/knowledge/experiments/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/experiments/[slug]/route.ts` |
| `GET` | `/api/knowledge/glossary` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/glossary/route.ts` |
| `POST` | `/api/knowledge/glossary` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/glossary/route.ts` |
| `GET` | `/api/knowledge/glossary/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/glossary/[slug]/route.ts` |
| `PUT` | `/api/knowledge/glossary/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/glossary/[slug]/route.ts` |
| `DELETE` | `/api/knowledge/glossary/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/glossary/[slug]/route.ts` |
| `GET` | `/api/knowledge/glossary/random` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/glossary/random/route.ts` |
| `GET` | `/api/knowledge/references` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/references/route.ts` |
| `POST` | `/api/knowledge/references` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/references/route.ts` |
| `GET` | `/api/knowledge/references/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/references/[id]/route.ts` |
| `PUT` | `/api/knowledge/references/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/references/[id]/route.ts` |
| `DELETE` | `/api/knowledge/references/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/references/[id]/route.ts` |
| `GET` | `/api/knowledge/relationships` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/relationships/route.ts` |
| `POST` | `/api/knowledge/relationships` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/relationships/route.ts` |
| `GET` | `/api/knowledge/scientists` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/scientists/route.ts` |
| `POST` | `/api/knowledge/scientists` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/scientists/route.ts` |
| `GET` | `/api/knowledge/scientists/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/scientists/[slug]/route.ts` |
| `PUT` | `/api/knowledge/scientists/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/scientists/[slug]/route.ts` |
| `DELETE` | `/api/knowledge/scientists/[slug]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/scientists/[slug]/route.ts` |
| `GET` | `/api/knowledge/search` | session | no | no | no | — | `knowledge` | 2 | `app/api/knowledge/search/route.ts` |
| `GET` | `/api/knowledge/search/autocomplete` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/search/autocomplete/route.ts` |
| `GET` | `/api/knowledge/taxonomy` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/taxonomy/route.ts` |
| `POST` | `/api/knowledge/taxonomy` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/taxonomy/route.ts` |
| `GET` | `/api/knowledge/taxonomy/[nodeId]` | role:admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/taxonomy/[nodeId]/route.ts` |
| `DELETE` | `/api/knowledge/taxonomy/[nodeId]` | role:admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/taxonomy/[nodeId]/route.ts` |
| `GET` | `/api/knowledge/taxonomy/[nodeId]/children` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/taxonomy/[nodeId]/children/route.ts` |
| `GET` | `/api/knowledge/taxonomy/tree` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/taxonomy/tree/route.ts` |
| `GET` | `/api/knowledge/timeline` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/timeline/route.ts` |
| `POST` | `/api/knowledge/timeline` | role:curator | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/timeline/route.ts` |
| `GET` | `/api/knowledge/timeline/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/timeline/[id]/route.ts` |
| `PUT` | `/api/knowledge/timeline/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/timeline/[id]/route.ts` |
| `DELETE` | `/api/knowledge/timeline/[id]` | role:contributor\|admin | no | no | no | — | `audit`, `knowledge` | 1 | `app/api/knowledge/timeline/[id]/route.ts` |
| `GET` | `/api/knowledge/timeline/spine` | session | no | no | no | — | `knowledge` | 1 | `app/api/knowledge/timeline/spine/route.ts` |

### `navigation` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/navigation` | session | no | no | no | — | — | 1 | `app/api/navigation/route.ts` |

### `neural-paths` (5 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/neural-paths` | session | no | no | no | — | `neural-paths` | 2 | `app/api/neural-paths/route.ts` |
| `GET` | `/api/neural-paths/[id]` | session | no | no | no | — | `neural-paths` | 2 | `app/api/neural-paths/[id]/route.ts` |
| `POST` | `/api/neural-paths/complete-chapter` | session | no | no | no | — | — | 1 | `app/api/neural-paths/complete-chapter/route.ts` |
| `POST` | `/api/neural-paths/start` | session | no | no | no | — | `neural-paths` | 0 | `app/api/neural-paths/start/route.ts` |
| `GET` | `/api/neural-paths/stats` | session | no | no | no | — | `neural-paths` | 0 | `app/api/neural-paths/stats/route.ts` |

### `notifications` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/notifications` | session | no | no | no | `evolution-log`, `recommendation` | — | 1 | `app/api/notifications/route.ts` |

### `recommendations` (2 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/recommendations` | session | no | no | no | — | `recommendations` | 1 | `app/api/recommendations/route.ts` |
| `POST` | `/api/recommendations/click` | session | no | no | no | — | `recommendations` | 1 | `app/api/recommendations/click/route.ts` |

### `simulations` (4 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/simulations/config` | public | no | no | no | — | — | 2 | `app/api/simulations/config/route.ts` |
| `GET` | `/api/simulations/history` | session | no | no | no | `simulation-run` | — | 2 | `app/api/simulations/history/route.ts` |
| `POST` | `/api/simulations/interpret` | session | yes | yes | yes | `simulation-run` | — | 2 | `app/api/simulations/interpret/route.ts` |
| `POST` | `/api/simulations/natural-language` | session | yes | yes | no | — | — | 2 | `app/api/simulations/natural-language/route.ts` |

### `spark` (4 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `POST` | `/api/spark/chat` | session | no | no | yes | — | `spark` | 3 | `app/api/spark/chat/route.ts` |
| `GET` | `/api/spark/context` | session | no | no | no | — | `spark` | 0 | `app/api/spark/context/route.ts` |
| `GET` | `/api/spark/history` | session | no | no | no | — | `spark` | 0 | `app/api/spark/history/route.ts` |
| `POST` | `/api/spark/sessions` | session | no | no | no | — | `spark-ai` | 0 | `app/api/spark/sessions/route.ts` |

### `users` (1 route files)

| Method | Path | Auth | CSRF | Rate limit | SSE | Models | Modules | Consumers | Source |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| `GET` | `/api/users/profile` | session | no | no | no | `evolution-log`, `neural-path`, `recommendation`, `simulation-run`, `spark-session`, `user`, `user-progress` | — | 2 | `app/api/users/profile/route.ts` |

## Consumer index

Only routes with at least one consumer are listed. Use this to order cutover work: an endpoint with no consumers can be deprecated instead of ported.

| Path | Consumers |
| --- | --- |
| `/api/auth/csrf` | `components/auth/login-form.tsx`<br>`components/auth/signup-form.tsx`<br>`components/dashboard/side-nav.tsx`<br>`components/security/csrf-fetch-provider.tsx`<br>`components/workspace/command-bar.tsx` |
| `/api/auth/login` | `components/auth/login-form.tsx` |
| `/api/auth/register` | `components/auth/signup-form.tsx` |
| `/api/auth/session` | `components/dashboard/side-nav.tsx`<br>`components/workspace/command-bar.tsx`<br>`middleware.ts` |
| `/api/cognitive/graph` | `hooks/useKnowledgeGraph.ts` |
| `/api/cognitive/graph/nodes` | `hooks/useKnowledgeGraph.ts` |
| `/api/cognitive/graph/nodes/[id]` | `hooks/useKnowledgeGraph.ts` |
| `/api/cognitive/graph/nodes/[id]/related` | `hooks/useKnowledgeGraph.ts` |
| `/api/cognitive/memory` | `hooks/useUserMemory.ts` |
| `/api/cognitive/profile` | `hooks/useCognitiveProfile.ts` |
| `/api/dashboard/secret` | `components/dashboard/dashboard-secret.tsx` |
| `/api/dashboard/summary` | `app/(platform)/dashboard/page.tsx` |
| `/api/dock` | `components/workspace/bottom-dock.tsx` |
| `/api/evolution/logs` | `app/(platform)/dashboard/evolution/page.tsx` |
| `/api/evolution/me` | `app/(platform)/dashboard/evolution/page.tsx` |
| `/api/explore/activity` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/explore/domains` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/explore/navigation` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/explore/trending` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/knowledge/citations` | `hooks/useCitations.ts` |
| `/api/knowledge/citations/[id]` | `hooks/useCitations.ts` |
| `/api/knowledge/citations/[id]/format` | `hooks/useCitations.ts` |
| `/api/knowledge/concepts` | `hooks/useConcepts.ts` |
| `/api/knowledge/concepts/[slug]` | `hooks/useConcept.ts` |
| `/api/knowledge/concepts/[slug]/publish` | `hooks/useConcept.ts` |
| `/api/knowledge/concepts/[slug]/rate` | `hooks/useConcept.ts` |
| `/api/knowledge/concepts/[slug]/relationships` | `hooks/useConcept.ts` |
| `/api/knowledge/concepts/[slug]/traverse` | `hooks/useConcept.ts` |
| `/api/knowledge/domains` | `hooks/useDomains.ts` |
| `/api/knowledge/encyclopedia` | `hooks/useEncyclopedia.ts` |
| `/api/knowledge/encyclopedia/[slug]` | `hooks/useEncyclopedia.ts` |
| `/api/knowledge/encyclopedia/featured` | `hooks/useEncyclopedia.ts` |
| `/api/knowledge/equations` | `hooks/useEquations.ts` |
| `/api/knowledge/equations/[id]` | `hooks/useEquations.ts` |
| `/api/knowledge/equations/solvable` | `hooks/useEquations.ts` |
| `/api/knowledge/experiments` | `hooks/useExperiments.ts` |
| `/api/knowledge/experiments/[slug]` | `hooks/useExperiments.ts` |
| `/api/knowledge/glossary` | `hooks/useGlossary.ts` |
| `/api/knowledge/glossary/[slug]` | `hooks/useGlossary.ts` |
| `/api/knowledge/glossary/random` | `hooks/useGlossary.ts` |
| `/api/knowledge/references` | `hooks/useReferences.ts` |
| `/api/knowledge/references/[id]` | `hooks/useReferences.ts` |
| `/api/knowledge/relationships` | `hooks/useRelationships.ts` |
| `/api/knowledge/scientists` | `hooks/useScientists.ts` |
| `/api/knowledge/scientists/[slug]` | `hooks/useScientists.ts` |
| `/api/knowledge/search` | `components/workspace/command-palette.tsx`<br>`hooks/useKnowledgeSearch.ts` |
| `/api/knowledge/search/autocomplete` | `hooks/useKnowledgeSearch.ts` |
| `/api/knowledge/taxonomy` | `hooks/useTaxonomy.ts` |
| `/api/knowledge/taxonomy/[nodeId]` | `hooks/useTaxonomy.ts` |
| `/api/knowledge/taxonomy/[nodeId]/children` | `hooks/useTaxonomy.ts` |
| `/api/knowledge/taxonomy/tree` | `hooks/useTaxonomy.ts` |
| `/api/knowledge/timeline` | `hooks/useTimeline.ts` |
| `/api/knowledge/timeline/[id]` | `hooks/useTimeline.ts` |
| `/api/knowledge/timeline/spine` | `hooks/useTimeline.ts` |
| `/api/navigation` | `components/workspace/workspace-nav.tsx` |
| `/api/neural-paths` | `app/(platform)/dashboard/explore/page.tsx`<br>`app/(platform)/dashboard/neural-paths/page.tsx` |
| `/api/neural-paths/[id]` | `app/(platform)/dashboard/neural-paths/[pathId]/chapter/[chapterId]/page.tsx`<br>`app/(platform)/dashboard/neural-paths/[pathId]/page.tsx` |
| `/api/neural-paths/complete-chapter` | `app/(platform)/dashboard/neural-paths/[pathId]/chapter/[chapterId]/page.tsx` |
| `/api/notifications` | `components/workspace/command-bar.tsx` |
| `/api/recommendations` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/recommendations/click` | `app/(platform)/dashboard/explore/page.tsx` |
| `/api/simulations/config` | `components/simulations/simulation-config-client.ts`<br>`src/lib/simulation/config-payload.ts` |
| `/api/simulations/history` | `components/simulation-runner/simulation-runner.tsx`<br>`components/simulations/continue-experimenting.tsx` |
| `/api/simulations/interpret` | `components/simulation-runner/simulation-runner.tsx`<br>`src/lib/simulation/schemas.ts` |
| `/api/simulations/natural-language` | `components/simulation-runner/natural-language-input.tsx`<br>`src/lib/simulation/schemas.ts` |
| `/api/spark/chat` | `components/matrix/matrix-hud.tsx`<br>`components/spark/spark-chat-area.tsx`<br>`src/modules/spark-ai/spark-ai.service.ts` |
| `/api/users/profile` | `app/(platform)/dashboard/profile/page.tsx`<br>`components/workspace/command-bar.tsx` |

## Unreferenced routes

These handlers have no source reference in the frontend. They must still be inventoried, but they are deprecation candidates and require an explicit decision in the owning task.

- `/api/action` (POST; session; app/api/action/route.ts)
- `/api/auth/refresh` (POST; public; app/api/auth/refresh/route.ts)
- `/api/cognitive/context` (GET, POST; session; app/api/cognitive/context/route.ts)
- `/api/cognitive/discoveries` (GET, POST; session; app/api/cognitive/discoveries/route.ts)
- `/api/cognitive/graph/nodes/edge` (POST; session; app/api/cognitive/graph/nodes/edge/route.ts)
- `/api/cognitive/recommendations` (GET, POST; session; app/api/cognitive/recommendations/route.ts)
- `/api/evolution/add-xp` (POST; session; app/api/evolution/add-xp/route.ts)
- `/api/evolution/leaderboard` (GET; public; app/api/evolution/leaderboard/route.ts)
- `/api/evolution/stats` (GET; session; app/api/evolution/stats/route.ts)
- `/api/evolution/streak` (POST; session; app/api/evolution/streak/route.ts)
- `/api/explore/concepts` (GET; session; app/api/explore/concepts/route.ts)
- `/api/explore/recommendations` (GET; session; app/api/explore/recommendations/route.ts)
- `/api/health` (GET; public; app/api/health/route.ts)
- `/api/neural-paths/start` (POST; session; app/api/neural-paths/start/route.ts)
- `/api/neural-paths/stats` (GET; session; app/api/neural-paths/stats/route.ts)
- `/api/spark/context` (GET; session; app/api/spark/context/route.ts)
- `/api/spark/history` (GET; session; app/api/spark/history/route.ts)
- `/api/spark/sessions` (POST; session; app/api/spark/sessions/route.ts)

