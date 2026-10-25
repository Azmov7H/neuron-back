import { describe, it, expect } from 'vitest';
import {
  API_PREFIX,
  API_ROUTES,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  CSRF_TOKEN_TTL_SECONDS,
  JWT_ALGORITHM,
} from '../src/index.js';

describe('API routes', () => {
  it('prefixes every static route with /api/v1', () => {
    const staticRoutes = [
      API_ROUTES.health,
      API_ROUTES.auth.login,
      API_ROUTES.auth.session,
      API_ROUTES.simulations.interpret,
      API_ROUTES.knowledge.concepts,
      API_ROUTES.cognitive.graph,
      API_ROUTES.users.profile,
    ];
    for (const route of staticRoutes) {
      expect(route.startsWith(`${API_PREFIX}/`)).toBe(true);
      expect(route).not.toContain('//');
    }
  });

  it('builds encoded dynamic paths', () => {
    expect(API_ROUTES.knowledge.concept('special relativity')).toBe(
      '/api/v1/knowledge/concepts/special%20relativity',
    );
    expect(API_ROUTES.knowledge.conceptTraverse('a/b')).toBe(
      '/api/v1/knowledge/concepts/a%2Fb/traverse',
    );
    expect(API_ROUTES.cognitive.graphNodeRelated('x/y')).toBe(
      '/api/v1/cognitive/graph/nodes/x%2Fy/related',
    );
  });
});

describe('auth contract constants', () => {
  it('freezes cookie and CSRF names', () => {
    expect(ACCESS_COOKIE_NAME).toBe('neuron_session');
    expect(REFRESH_COOKIE_NAME).toBe('neuron_refresh');
    expect(CSRF_COOKIE_NAME).toBe('neuron_csrf');
    expect(CSRF_HEADER_NAME).toBe('x-csrf-token');
    expect(CSRF_TOKEN_TTL_SECONDS).toBe(86_400);
    expect(JWT_ALGORITHM).toBe('HS256');
  });
});
