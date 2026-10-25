/**
 * Simulation Config Payload — pure aggregation.
 *
 * The single aggregation of the registry into the client-facing catalog
 * shape. Used by BOTH the `/api/simulations/config` route and the client
 * local fallback, so the API contract and the client contract can never
 * diverge (they share one type and one builder).
 *
 * Presentation fields (colorClass/glowClass/accentHex) are injected through
 * the `styles` argument. The UI passes its icon-bearing definition; the API
 * and the browser fallback use `SIMULATION_DOMAIN_STYLES`, which carries the
 * exact same wire values. The registry itself owns only simulation identity
 * and data.
 */

import { DOMAIN_ORDER, getAllSimulations, toClientSimulation } from './registry.js';
import type { ClientSimulation, ScientificDomain } from './registry.types.js';

/**
 * Exact wire shape of `GET /api/simulations/config` (and of the client
 * config cache). One type for both sides of the fetch.
 */
export interface SimulationDomainConfig {
  domainKey: ScientificDomain;
  name: string;
  colorClass: string;
  glowClass: string;
  accentHex: string;
  simulations: ClientSimulation[];
}

/** The presentation fields that cross the simulation config wire. */
export interface SimulationDomainStyle {
  displayName: string;
  colorClass: string;
  glowClass: string;
  accentHex: string;
}

/**
 * Default wire styles. Values are byte-for-byte the ones the UI has always
 * served from `DOMAIN_STYLES`; only the UI-only fields (icons, Tailwind
 * tokens) are absent here.
 */
export const SIMULATION_DOMAIN_STYLES: Record<ScientificDomain, SimulationDomainStyle> = {
  physics: {
    displayName: 'Physics Labs',
    colorClass: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]',
    accentHex: '#3b82f6',
  },
  biology: {
    displayName: 'Biology Labs',
    colorClass: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
    accentHex: '#10b981',
  },
  anatomy: {
    displayName: 'Anatomy Labs',
    colorClass: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(251,113,133,0.15)]',
    accentHex: '#f43f5e',
  },
  mathematics: {
    displayName: 'Math Labs',
    colorClass: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    accentHex: '#fbbf24',
  },
  quantum: {
    displayName: 'Quantum Labs',
    colorClass: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]',
    accentHex: '#c084fc',
  },
  space: {
    displayName: 'Space Labs',
    colorClass: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    glowClass: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    accentHex: '#22d3ee',
  },
};

export function buildSimulationConfigPayload(
  styles: Record<ScientificDomain, SimulationDomainStyle> = SIMULATION_DOMAIN_STYLES,
): SimulationDomainConfig[] {
  const all = getAllSimulations();
  return DOMAIN_ORDER.map((domain) => {
    const style = styles[domain];
    return {
      domainKey: domain,
      name: style.displayName,
      colorClass: style.colorClass,
      glowClass: style.glowClass,
      accentHex: style.accentHex,
      simulations: all[domain].map(toClientSimulation),
    };
  });
}
