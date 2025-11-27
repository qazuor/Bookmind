/**
 * useStats Hook (P5-021)
 *
 * TanStack Query hook for dashboard statistics.
 */

import { type UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  type ActivityStatsResponse,
  type OverviewStatsResponse,
  statsApi,
} from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

/**
 * Hook for fetching overview stats
 */
export function useOverviewStats(
  options?: Omit<
    UseQueryOptions<OverviewStatsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.stats.overview(),
    queryFn: () => statsApi.overview(),
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

/**
 * Hook for fetching activity stats
 */
export function useActivityStats(
  days = 30,
  options?: Omit<
    UseQueryOptions<ActivityStatsResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: queryKeys.stats.activity(days),
    queryFn: () => statsApi.activity(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Combined hook for dashboard data
 */
export function useDashboardStats() {
  const overview = useOverviewStats();
  const activity = useActivityStats();

  return {
    overview,
    activity,
    isLoading: overview.isLoading || activity.isLoading,
    isError: overview.isError || activity.isError,
    error: overview.error || activity.error,
  };
}
