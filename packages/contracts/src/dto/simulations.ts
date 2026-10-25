/**
 * Simulation persistence wire contracts.
 *
 * Mongoose documents are never returned directly: `_id` becomes a string,
 * dates become ISO strings, and map-backed fields become plain objects. The
 * history endpoint has always serialized this way through JSON.
 */

export type SimulationStateTypeDTO = 'dynamic' | 'parameterized_visualization' | 'conceptual';

export interface SimulationRunMetadataDTO {
  domain: string;
  simulationType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  aiModel: string;
  source: 'ai' | 'deterministic';
  fallbackReason?: 'missing_api_key' | 'timeout' | 'provider_error';
}

export interface SimulationRunInterpretationDTO {
  explanation: string;
  keyInsights: string[];
  concepts: string[];
  recommendedActions: string[];
  metadata: SimulationRunMetadataDTO;
}

/** Exact shape of one item returned by `GET /api/simulations/history`. */
export interface SimulationHistoryRunDTO {
  _id: string;
  simulationId: string;
  userId: string;
  domain: string;
  parameters: Record<string, number>;
  stateSnapshot: Record<string, unknown>;
  aiInterpretation: SimulationRunInterpretationDTO;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Request body accepted by `POST /api/simulations/interpret`. */
export interface SimulationRunCreateDTO {
  simulationId: string;
  /** Persisted Title-Cased by legacy convention (e.g. `Physics`). */
  domain: string;
  parameters: Record<string, number>;
  entities?: unknown[];
  metrics?: Record<string, number>;
  userQuestion?: string;
  stateSnapshot?: Record<string, unknown>;
  stateType?: SimulationStateTypeDTO;
  simulationTime?: number;
}

/** `GET /api/simulations/config` envelope data is a list of these entries. */
export interface SimulationConfigDomainDTO {
  domainKey: string;
  name: string;
  colorClass: string;
  glowClass: string;
  accentHex: string;
  simulations: Array<{
    id: string;
    name: string;
    desc: string;
    equation: string;
    defaultParams: Record<string, number>;
    paramsList: Array<{
      key: string;
      label: string;
      description?: string;
      unit?: string;
      type: 'number' | 'integer';
      min: number;
      max: number;
      step: number;
      default: number;
      required: boolean;
    }>;
  }>;
}
