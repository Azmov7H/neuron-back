/**
 * App-shell navigation wire contract.
 * Icons are lucide names; the client resolves them locally.
 */

import type { Role } from '../roles.js';

export interface NavItemDTO {
  id: string;
  label: string;
  icon: string;
  href: string;
  color?: string;
  shortcut?: string;
  /** Roles permitted to see this item. Omitted = visible to everyone. */
  roles?: Role[];
}

export interface NavSectionDTO {
  id: string;
  title: string;
  items: NavItemDTO[];
}

export interface NavigationResponseDTO {
  sections: NavSectionDTO[];
}
