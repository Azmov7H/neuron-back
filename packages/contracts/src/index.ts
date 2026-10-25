/**
 * Public surface of `@azmov7h/neuron-contracts`.
 *
 * Framework-free API contracts shared by the browser, the Next.js cutover
 * client, and the NestJS API: envelope, errors, roles, routes, auth
 * transport, cross-cutting DTOs, and pure request-validation schemas.
 *
 * Nothing here may import Mongoose, Next.js, or read environment variables.
 */

export { ERROR_CODES, type ErrorCode, AppError, isAppError } from './errors.js';

export {
  type ApiErrorPayload,
  type ApiResponse,
  type PaginatedResponse,
  type ApiResult,
  success,
  created,
  paginated,
  failure,
  validationFailure,
  toFieldErrors,
  zodValidationFailure,
} from './envelope.js';

export { ROLES, type Role, ROLE_HIERARCHY, isRole, hasMinimumRole } from './roles.js';

export {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_TOKEN_TTL_SECONDS,
  AUTH_COOKIE_PATH,
  AUTH_COOKIE_SAME_SITE,
  JWT_ALGORITHM,
  type JWTPayload,
  type AuthTokens,
  type RequestContext,
  type AuthUserDTO,
  type AuthResponseDTO,
  type LogoutResponseDTO,
} from './auth.js';

export { API_PREFIX, API_ROUTES } from './routes.js';

export {
  type KnowledgeDomain,
  SUPPORTED_DOMAINS,
  type Difficulty,
  type LearningLevel,
  type RelationshipType,
  RELATIONSHIP_TYPES,
  type MediaKind,
  type SourceProvider,
  type CitationStyle,
  type TimelineEra,
} from './domains/knowledge.js';

export * from './dto/dashboard.js';
export * from './dto/dock.js';
export * from './dto/navigation.js';
export * from './dto/notifications.js';
export * from './dto/simulations.js';

export * from './schemas/platform.js';
export * from './schemas/knowledge.js';
