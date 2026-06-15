import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export interface BlacklistEntry {
  id: string;
  type: 'key' | 'hwid' | 'ip';
  value: string;
  reason: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBlacklistInput {
  type: 'key' | 'hwid' | 'ip';
  value: string;
  reason: string;
}

export function useBlacklistQuery(type?: string) {
  return useQuery<BlacklistEntry[]>({
    queryKey: queryKeys.blacklist(type),
    queryFn: () => {
      const endpoint = type && type !== 'ALL' ? `/api/v1/admin/blacklist?type=${type}` : '/api/v1/admin/blacklist';
      return apiFetch<BlacklistEntry[]>(endpoint);
    },
  });
}

export function useAddBlacklistMutation() {
  const queryClient = useQueryClient();
  return useMutation<BlacklistEntry, Error, AddBlacklistInput>({
    mutationFn: (data) =>
      apiFetch<BlacklistEntry>('/api/v1/admin/blacklist', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRemoveBlacklistMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { type: string; value: string }>({
    mutationFn: (data) =>
      apiFetch<void>(`/api/v1/admin/blacklist?type=${data.type}&value=${encodeURIComponent(data.value)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blacklist'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
