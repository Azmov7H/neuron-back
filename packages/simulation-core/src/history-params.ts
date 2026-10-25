/**
 * History API Parameter Guards — pure half.
 *
 * The Mongo query builder (`buildHistoryQuery`) stays server-side because it
 * depends on Mongoose and on the authenticated user id. Everything here is
 * framework-free and safe to run in the browser.
 */

export const HISTORY_LIMIT_MIN = 1;
export const HISTORY_LIMIT_MAX = 100;
export const HISTORY_LIMIT_DEFAULT = 15;

export interface HistoryFilters {
  domain?: string | null;
  simulationId?: string | null;
}

/**
 * Resolves a raw `limit` query value to a safe integer within [1, 100].
 * Non-numeric input falls back to the default; out-of-range values are
 * clamped into bounds rather than rejected, keeping the existing API
 * ergonomics intact.
 */
export function parseHistoryLimit(
  raw: string | null | undefined,
  fallback: number = HISTORY_LIMIT_DEFAULT,
): number {
  if (raw === null || raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  const floored = Math.floor(n);
  if (floored < HISTORY_LIMIT_MIN) return HISTORY_LIMIT_MIN;
  if (floored > HISTORY_LIMIT_MAX) return HISTORY_LIMIT_MAX;
  return floored;
}
