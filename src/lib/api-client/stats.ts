/**
 * Stats API Client (P5-013)
 *
 * Client for dashboard statistics and analytics.
 */

import { apiGet } from "./fetch";

/**
 * Category stats
 */
export interface CategoryStat {
  id: string;
  name: string;
  color?: string;
  count: number;
}

/**
 * Tag stats
 */
export interface TagStat {
  id: string;
  name: string;
  color?: string;
  count: number;
}

/**
 * Activity item
 */
export interface ActivityItem {
  date: string;
  count: number;
}

/**
 * Overview stats response
 */
export interface OverviewStatsResponse {
  data: {
    totalBookmarks: number;
    totalCategories: number;
    totalCollections: number;
    totalTags: number;
    archivedCount: number;
    favoriteCount: number;
    publicCount: number;
    recentCount: number; // Last 7 days
    categoryStats: CategoryStat[];
    tagStats: TagStat[];
  };
}

/**
 * Activity stats response
 */
export interface ActivityStatsResponse {
  data: {
    activity: ActivityItem[];
    totalInPeriod: number;
    averagePerDay: number;
    mostActiveDay: string;
  };
}

/**
 * Stats API client
 */
export const statsApi = {
  /**
   * Get dashboard overview stats
   */
  overview(): Promise<OverviewStatsResponse> {
    return apiGet<OverviewStatsResponse>("/stats");
  },

  /**
   * Get activity stats for a period
   */
  activity(days = 30): Promise<ActivityStatsResponse> {
    return apiGet<ActivityStatsResponse>("/stats", { activity: true, days });
  },

  /**
   * Get combined stats (overview + activity)
   */
  async dashboard(): Promise<{
    overview: OverviewStatsResponse["data"];
    activity: ActivityStatsResponse["data"];
  }> {
    const [overview, activity] = await Promise.all([
      statsApi.overview(),
      statsApi.activity(),
    ]);

    return {
      overview: overview.data,
      activity: activity.data,
    };
  },
};
