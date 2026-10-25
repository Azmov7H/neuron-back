/**
 * Auth transport contracts.
 *
 * Cookie names and attributes are part of the wire contract with the
 * browser: the Next.js middleware and the NestJS API must agree on them.
 * TTLs are derived from the JWT `exp` claim, exactly as before.
 */

import type { Role } from './roles.js';

export const ACCESS_COOKIE_NAME = 'neuron_session';
export const REFRESH_COOKIE_NAME = 'neuron_refresh';
export const CSRF_COOKIE_NAME = 'neuron_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Legacy CSRF token lifespan: 24 hours. */
export const CSRF_TOKEN_TTL_SECONDS = 60 * 60 * 24;

export const AUTH_COOKIE_PATH = '/';
export const AUTH_COOKIE_SAME_SITE = 'lax';

/** The only signing algorithm accepted for access and refresh tokens. */
export const JWT_ALGORITHM = 'HS256';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in seconds, computed from `exp`. */
  expiresIn: number;
}

export interface RequestContext {
  userId: string;
  email: string;
  username: string;
  role: Role;
  isAuthenticated: boolean;
}

/**
 * Public user shape returned by auth endpoints. Dates are ISO strings at the
 * wire boundary; Mongoose documents are mapped before serialization.
 */
export interface AuthUserDTO {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  role: Role;
  rank: string;
  totalXP: number;
  streak: number;
  preferredDomains: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDTO {
  user: AuthUserDTO;
}

export interface LogoutResponseDTO {
  message: string;
}
