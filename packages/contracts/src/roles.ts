/**
 * RBAC roles.
 *
 * Precedence is frozen: user < contributor < curator < admin. Guards compare
 * numeric levels, so adding a role between existing ones is a breaking
 * change and needs a major version bump.
 */

export const ROLES = ['user', 'contributor', 'curator', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_HIERARCHY: Record<Role, number> = {
  user: 0,
  contributor: 1,
  curator: 2,
  admin: 3,
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** True when `role` is at least `minimum`. Unknown roles never pass. */
export function hasMinimumRole(role: Role, minimum: Role): boolean {
  const level = ROLE_HIERARCHY[role];
  const required = ROLE_HIERARCHY[minimum];
  if (level === undefined || required === undefined) return false;
  return level >= required;
}
