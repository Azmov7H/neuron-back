/**
 * Package surface contracts.
 * These assertions guard the properties the frontend and backend rely on when
 * they import a built (not source-linked) copy of this package.
 */

import { describe, it, expect } from 'vitest';
import {
  AUDIT_DYNAMIC_SIM_IDS,
  DOMAIN_ORDER,
  INTERACTIVE_SIM_IDS,
  SCIENTIFIC_DOMAINS,
  SIMULATION_REGISTRY,
  buildSimulationConfigPayload,
  getAllSimulations,
  getSimulationStateType,
} from '../src/index.js';

describe('package surface', () => {
  it('keeps DOMAIN_ORDER identical to the canonical domain tuple', () => {
    expect(DOMAIN_ORDER).toBe(SCIENTIFIC_DOMAINS);
    expect([...DOMAIN_ORDER]).toEqual([
      'physics',
      'biology',
      'anatomy',
      'mathematics',
      'quantum',
      'space',
    ]);
  });

  it('keeps a single interactive ID list and registry instance', () => {
    expect(INTERACTIVE_SIM_IDS).toHaveLength(17);
    expect(SIMULATION_REGISTRY.size).toBe(48);
    expect(Object.values(getAllSimulations()).flat()).toHaveLength(48);
  });

  it('classifies every interactive simulation exactly once', () => {
    const types = INTERACTIVE_SIM_IDS.map(getSimulationStateType);
    expect(types.filter((t) => t === 'dynamic')).toHaveLength(6);
    expect(types.filter((t) => t === 'parameterized_visualization')).toHaveLength(11);
    expect(getSimulationStateType('not-a-real-sim')).toBe('conceptual');
  });

  it('keeps the audit dynamic IDs frozen and inside the interactive set', () => {
    expect(Object.isFrozen(AUDIT_DYNAMIC_SIM_IDS)).toBe(true);
    for (const id of AUDIT_DYNAMIC_SIM_IDS) {
      expect(INTERACTIVE_SIM_IDS).toContain(id);
    }
  });

  it('builds the config wire payload with the historical presentation values', () => {
    const payload = buildSimulationConfigPayload();
    expect(payload).toHaveLength(6);
    expect(payload.map((entry) => entry.domainKey)).toEqual([...DOMAIN_ORDER]);
    expect(payload.reduce((total, entry) => total + entry.simulations.length, 0)).toBe(48);

    const physics = payload[0];
    expect(physics).toMatchObject({
      domainKey: 'physics',
      name: 'Physics Labs',
      colorClass: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      glowClass: 'shadow-[0_0_20px_rgba(96,165,250,0.15)]',
      accentHex: '#3b82f6',
    });
    expect(Object.keys(payload[3]?.simulations[0] ?? {})).toEqual([
      'id',
      'name',
      'desc',
      'equation',
      'defaultParams',
      'paramsList',
    ]);
  });
});
