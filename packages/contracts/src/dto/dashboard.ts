/**
 * Dashboard summary wire contract.
 * Dates cross the wire as ISO strings.
 */

export interface DashboardSummaryDTO {
  user: {
    username: string;
    rank: string;
    totalXP: number;
    streak: number;
    avatar?: string;
  };
  activePath: {
    pathId: string;
    title: string;
    domain: string;
    currentChapterTitle: string;
    overallCompletion: number;
    milestones: Array<{ label: string; completed: boolean; current: boolean }>;
  } | null;
  weeklyStats: {
    weeklyXP: number;
    conceptsMastered: number;
    cognitiveVelocityLabel: string;
  };
  recentDiscoveries: Array<{
    concept: string;
    domain: string;
    discoveredAt: string;
  }>;
}

export interface DashboardSecretDTO {
  secret: string;
}
