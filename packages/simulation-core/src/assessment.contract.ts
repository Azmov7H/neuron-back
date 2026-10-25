/**
 * Assessment Source Contract — client-safe leaf module.
 * Pure types, constants, and builders with NO server dependencies.
 *
 * Kept separate from assessment.ts because client components import the
 * fallback labels for the Spark panel, and assessment.ts imports
 * @/config/env — which reads JWT_SECRET etc. at module load and throws when
 * those variables are absent from the browser bundle. Anything a client can
 * touch must live here; server-only helpers (getConfiguredAiModel) stay in
 * assessment.ts, which re-exports this module for server consumers.
 */

export type AssessmentSource = 'ai' | 'deterministic';

export type AssessmentFallbackReason = 'missing_api_key' | 'timeout' | 'provider_error';

export interface AssessmentMetadata {
  domain: string;
  simulationType: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /**
   * The model (or deterministic generator) that produced the assessment.
   * Never equals the configured AI model when source === 'deterministic'.
   */
  aiModel: string;
  source: AssessmentSource;
  fallbackReason?: AssessmentFallbackReason;
}

/**
 * Clear identifier for the deterministic fallback generator. Must never be
 * confused with a real AI model name.
 */
export const DETERMINISTIC_MODEL = 'neuron-local-deterministic-engine';

export const FALLBACK_REASON_LABELS: Record<AssessmentFallbackReason, string> = {
  missing_api_key: 'no AI API key configured',
  timeout: 'the AI request timed out',
  provider_error: 'the AI provider returned an error',
};

export interface BuildAssessmentMetadataInput {
  domain: string;
  simulationId: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  source: AssessmentSource;
  model: string;
  fallbackReason?: AssessmentFallbackReason;
}

/**
 * Single construction point for assessment metadata so the persisted record
 * (SimulationRun) and the streamed METADATA_EVENT can never diverge.
 */
export function buildAssessmentMetadata(input: BuildAssessmentMetadataInput): AssessmentMetadata {
  return {
    domain: input.domain,
    simulationType: input.simulationId,
    difficulty: input.difficulty ?? 'intermediate',
    aiModel: input.model,
    source: input.source,
    ...(input.fallbackReason ? { fallbackReason: input.fallbackReason } : {}),
  };
}
