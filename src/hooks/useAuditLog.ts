import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export interface AuditLogData {
  id: string;
  action: string;
  actorId: string;
  targetKey: string | null;
  details: Record<string, unknown>;
  ip: string | null;
  timestamp: string;
}

export interface AuditLogsResponse {
  logs: AuditLogData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useAuditLogQuery(filters: {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery<AuditLogsResponse>({
    queryKey: queryKeys.auditLog(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.action && filters.action !== 'ALL') params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      return apiFetch<AuditLogsResponse>(`/api/v1/admin/audit?${params.toString()}`);
    },
  });
}
