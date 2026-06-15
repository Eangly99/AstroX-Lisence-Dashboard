import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export interface DashboardStats {
  total: number;
  active: number;
  suspended: number;
  revoked: number;
  expired: number;
  types: Record<string, number>;
  plugins: Array<{
    _id: string;
    name: string;
    slug: string;
    count: number;
  }>;
  recentLogs: Array<{
    _id: string;
    action: string;
    actorId: string;
    targetKey: string | null;
    details: Record<string, unknown>;
    ip: string | null;
    timestamp: string;
  }>;
  deltas: {
    total: number;
    active: number;
    suspended: number;
    revoked: number;
    expired: number;
  };
}

export function useStatsQuery() {
  return useQuery<DashboardStats>({
    queryKey: queryKeys.stats(),
    queryFn: () => apiFetch<DashboardStats>('/api/v1/admin/stats'),
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
