/**
 * Versioned API route constants.
 *
 * The backend serves everything under `/api/v1` (global prefix `api` + URI
 * version `1`). Client code must build URLs from these constants so a path
 * cannot drift between the frontend and the API. Dynamic segments are
 * encoded once here.
 */

export const API_PREFIX = '/api/v1';

const path = (suffix: string): string => `${API_PREFIX}${suffix}`;
const segment = (value: string): string => encodeURIComponent(value);

export const API_ROUTES = {
  health: path('/health'),

  auth: {
    csrf: path('/auth/csrf'),
    login: path('/auth/login'),
    register: path('/auth/register'),
    refresh: path('/auth/refresh'),
    session: path('/auth/session'),
  },

  users: {
    profile: path('/users/profile'),
  },

  dashboard: {
    summary: path('/dashboard/summary'),
    secret: path('/dashboard/secret'),
  },

  navigation: path('/navigation'),
  notifications: path('/notifications'),
  dock: path('/dock'),
  action: path('/action'),

  evolution: {
    addXp: path('/evolution/add-xp'),
    leaderboard: path('/evolution/leaderboard'),
    logs: path('/evolution/logs'),
    me: path('/evolution/me'),
    stats: path('/evolution/stats'),
    streak: path('/evolution/streak'),
  },

  explore: {
    activity: path('/explore/activity'),
    concepts: path('/explore/concepts'),
    domains: path('/explore/domains'),
    navigation: path('/explore/navigation'),
    recommendations: path('/explore/recommendations'),
    trending: path('/explore/trending'),
  },

  neuralPaths: {
    list: path('/neural-paths'),
    detail: (id: string) => path(`/neural-paths/${segment(id)}`),
    completeChapter: path('/neural-paths/complete-chapter'),
    start: path('/neural-paths/start'),
    stats: path('/neural-paths/stats'),
  },

  simulations: {
    config: path('/simulations/config'),
    history: path('/simulations/history'),
    interpret: path('/simulations/interpret'),
    naturalLanguage: path('/simulations/natural-language'),
  },

  spark: {
    chat: path('/spark/chat'),
    context: path('/spark/context'),
    history: path('/spark/history'),
    sessions: path('/spark/sessions'),
  },

  recommendations: {
    list: path('/recommendations'),
    click: path('/recommendations/click'),
  },

  cognitive: {
    context: path('/cognitive/context'),
    discoveries: path('/cognitive/discoveries'),
    graph: path('/cognitive/graph'),
    graphNodes: path('/cognitive/graph/nodes'),
    graphNode: (id: string) => path(`/cognitive/graph/nodes/${segment(id)}`),
    graphNodeRelated: (id: string) => path(`/cognitive/graph/nodes/${segment(id)}/related`),
    graphEdge: path('/cognitive/graph/nodes/edge'),
    memory: path('/cognitive/memory'),
    profile: path('/cognitive/profile'),
    recommendations: path('/cognitive/recommendations'),
  },

  knowledge: {
    citations: path('/knowledge/citations'),
    citation: (id: string) => path(`/knowledge/citations/${segment(id)}`),
    citationFormat: (id: string) => path(`/knowledge/citations/${segment(id)}/format`),
    concepts: path('/knowledge/concepts'),
    concept: (slug: string) => path(`/knowledge/concepts/${segment(slug)}`),
    conceptPublish: (slug: string) => path(`/knowledge/concepts/${segment(slug)}/publish`),
    conceptRate: (slug: string) => path(`/knowledge/concepts/${segment(slug)}/rate`),
    conceptRelationships: (slug: string) =>
      path(`/knowledge/concepts/${segment(slug)}/relationships`),
    conceptTraverse: (slug: string) => path(`/knowledge/concepts/${segment(slug)}/traverse`),
    domains: path('/knowledge/domains'),
    encyclopedia: path('/knowledge/encyclopedia'),
    encyclopediaEntry: (slug: string) => path(`/knowledge/encyclopedia/${segment(slug)}`),
    encyclopediaFeatured: path('/knowledge/encyclopedia/featured'),
    equations: path('/knowledge/equations'),
    equation: (id: string) => path(`/knowledge/equations/${segment(id)}`),
    equationsSolvable: path('/knowledge/equations/solvable'),
    experiments: path('/knowledge/experiments'),
    experiment: (slug: string) => path(`/knowledge/experiments/${segment(slug)}`),
    glossary: path('/knowledge/glossary'),
    glossaryTerm: (slug: string) => path(`/knowledge/glossary/${segment(slug)}`),
    glossaryRandom: path('/knowledge/glossary/random'),
    references: path('/knowledge/references'),
    reference: (id: string) => path(`/knowledge/references/${segment(id)}`),
    relationships: path('/knowledge/relationships'),
    scientists: path('/knowledge/scientists'),
    scientist: (slug: string) => path(`/knowledge/scientists/${segment(slug)}`),
    search: path('/knowledge/search'),
    searchAutocomplete: path('/knowledge/search/autocomplete'),
    taxonomy: path('/knowledge/taxonomy'),
    taxonomyNode: (nodeId: string) => path(`/knowledge/taxonomy/${segment(nodeId)}`),
    taxonomyChildren: (nodeId: string) => path(`/knowledge/taxonomy/${segment(nodeId)}/children`),
    taxonomyTree: path('/knowledge/taxonomy/tree'),
    timeline: path('/knowledge/timeline'),
    timelineEvent: (id: string) => path(`/knowledge/timeline/${segment(id)}`),
    timelineSpine: path('/knowledge/timeline/spine'),
  },
} as const;
