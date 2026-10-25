/**
 * Public surface of `@azmov7h/neuron-simulation-core`.
 *
 * Everything exported here is pure: no environment access, no database, no
 * network, no UI framework. Both the browser and the NestJS API import this
 * package, so the registry, validation pipeline, and math can never diverge.
 */

export {
  SCIENTIFIC_DOMAINS,
  type ParameterType,
  type ScientificDomain,
  type SimulationParameter,
  type SimulationDefinition,
  type ClientSimulation,
} from './registry.types.js';

export {
  INTERACTIVE_SIM_IDS,
  isInteractiveSim,
  DOMAIN_LABELS,
  DOMAIN_ORDER,
  SIMULATION_REGISTRY,
  getSimulation,
  getSimulationsByDomain,
  getAllSimulations,
  getAllSimulationIds,
  toClientSimulation,
  type DomainIdentity,
} from './registry.js';

export {
  NlInterpretationRequestSchema,
  type NlInterpretationRequest,
  LlmInterpretationOutputSchema,
  type LlmInterpretationOutput,
  buildParameterSchema,
  type BoundCheckResult,
  checkParameterBounds,
  findMissingRequiredParams,
  clampSimulationParameters,
} from './schemas.js';

export {
  type AssessmentSource,
  type AssessmentFallbackReason,
  type AssessmentMetadata,
  type BuildAssessmentMetadataInput,
  DETERMINISTIC_MODEL,
  FALLBACK_REASON_LABELS,
  buildAssessmentMetadata,
} from './assessment.contract.js';

export { generateLocalSimulationFallback } from './deterministic-fallback.js';

export {
  AUDIT_CATEGORIES,
  type AuditCategory,
  DISPOSITIONS,
  type Disposition,
  DYNAMIC_SNAPSHOT_FIELDS,
  DYNAMIC_SIM_IDS as AUDIT_DYNAMIC_SIM_IDS,
  type AuditParameterIssue,
  type AuditSnapshotIssue,
  type AuditAiIssue,
  type AuditRunInput,
  type AuditResult,
  type AuditOptions,
  recordContentDigest,
  auditRun,
  detectDuplicates,
  type CleanupPlanEntry,
  type CleanupPlan,
  buildCleanupPlan,
  canDeleteSynthetic,
  type SnapshotExpectationRow,
  snapshotClassificationTable,
} from './audit.js';

export {
  matchSimulationByKeywords,
  type FallbackProposal,
  fallbackInterpret,
} from './fallback-interpreter.js';

export {
  LOTKA_VOLTERRA_COEFFICIENTS,
  LOTKA_VOLTERRA_EQUILIBRIUM,
  type LotkaVolterraSample,
  integrateLotkaVolterra,
} from './lotka-volterra.js';

export { sanitizeSnapshot } from './snapshot-sanitize.js';

export { presentEquation } from './equation-presentation.js';

export {
  HISTORY_LIMIT_MIN,
  HISTORY_LIMIT_MAX,
  HISTORY_LIMIT_DEFAULT,
  type HistoryFilters,
  parseHistoryLimit,
} from './history-params.js';

export { type SimulationStateType, type TelemetrySnapshot } from './simulation.types.js';

export {
  DYNAMIC_SIM_IDS,
  getSimulationStateType,
  SIMULATION_STATE_TYPES,
} from './simulation-state.js';

export {
  type NlReadyResult,
  type NlNeedsInputResult,
  type NlUnsupportedResult,
  type NlInterpretationResult,
  type NlInterpretOptions,
  type NlInterpreterLogger,
  noopNlInterpreterLogger,
  buildRegistrySystemPrompt,
  buildNlUserPrompt,
  unsupportedResult,
  resolveNlProposal,
} from './nl-interpreter.js';

export {
  type SimulationDomainConfig,
  type SimulationDomainStyle,
  SIMULATION_DOMAIN_STYLES,
  buildSimulationConfigPayload,
} from './config-payload.js';

export {
  SimulationRunCreateSchema,
  SimulationRunUpdateSchema,
  validateSimulationRun,
} from './simulation-run.js';
