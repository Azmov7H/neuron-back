/**
 * Knowledge-engine domain vocabulary.
 *
 * This is the 18-domain scientific knowledge taxonomy. It is intentionally
 * distinct from the six lab domains in `@azmov7h/neuron-simulation-core`
 * (physics, biology, anatomy, mathematics, quantum, space). Contracts export
 * this one as `KnowledgeDomain` to keep both sets unambiguous.
 *
 * Browser-safe: no Mongoose, no Next.js, no environment access.
 */

export type KnowledgeDomain =
  | 'physics'
  | 'mathematics'
  | 'biology'
  | 'human-anatomy'
  | 'microbiology'
  | 'astronomy'
  | 'astrophysics'
  | 'quantum-mechanics'
  | 'chemistry'
  | 'earth-science'
  | 'medicine'
  | 'neuroscience'
  | 'computer-science'
  | 'artificial-intelligence'
  | 'engineering'
  | 'philosophy-of-science'
  | 'statistics'
  | 'data-science';

export const SUPPORTED_DOMAINS: readonly KnowledgeDomain[] = [
  'physics',
  'mathematics',
  'biology',
  'human-anatomy',
  'microbiology',
  'astronomy',
  'astrophysics',
  'quantum-mechanics',
  'chemistry',
  'earth-science',
  'medicine',
  'neuroscience',
  'computer-science',
  'artificial-intelligence',
  'engineering',
  'philosophy-of-science',
  'statistics',
  'data-science',
] as const;

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningLevel = 'k12' | 'undergraduate' | 'graduate' | 'research';

export type RelationshipType =
  | 'isPartOf'
  | 'dependsOn'
  | 'requires'
  | 'extends'
  | 'derivedFrom'
  | 'oppositeOf'
  | 'causes'
  | 'explains'
  | 'uses'
  | 'similarTo'
  | 'applicationOf'
  | 'mathematicalRepresentation'
  | 'historicallyConnected'
  | 'scientificallyConnected';

export const RELATIONSHIP_TYPES: readonly RelationshipType[] = [
  'isPartOf',
  'dependsOn',
  'requires',
  'extends',
  'derivedFrom',
  'oppositeOf',
  'causes',
  'explains',
  'uses',
  'similarTo',
  'applicationOf',
  'mathematicalRepresentation',
  'historicallyConnected',
  'scientificallyConnected',
] as const;

export type MediaKind = 'image' | 'video' | 'threeDModel' | 'simulation' | 'quiz' | 'interactive';

export type SourceProvider =
  | 'wikipedia'
  | 'wikidata'
  | 'openalex'
  | 'pubmed'
  | 'nasa'
  | 'esa'
  | 'cern'
  | 'nist'
  | 'arxiv'
  | 'crossref'
  | 'doi'
  | 'manual';

export type CitationStyle = 'apa' | 'mla' | 'bibtex' | 'chicago';

export type TimelineEra =
  | 'ancient'
  | 'classical'
  | 'medieval'
  | 'renaissance'
  | 'scientific-revolution'
  | 'enlightenment'
  | 'industrial'
  | 'modern'
  | 'contemporary';
