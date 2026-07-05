import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export interface PluginInfo {
  _id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  licenseCount?: number;
}

export interface LicenseData {
  _id: string;
  key: string;
  pluginId: PluginInfo | string;
  ownerId: string;
  ownerTag: string;
  type: 'trial' | 'lifetime' | 'subscription';
  status: 'active' | 'suspended' | 'revoked' | 'expired';
  maxIps: number;
  allowedIps: string[];
  hwid: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  lastValidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
}

export interface LicensesResponse {
  licenses: LicenseData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LicenseDetailResponse {
  license: LicenseData;
  auditLogs: Array<{
    _id: string;
    action: string;
    actorId: string;
    targetKey: string | null;
    details: Record<string, unknown>;
    ip: string | null;
    timestamp: string;
  }>;
}

export interface CreateLicenseInput {
  pluginId: string;
  ownerId: string;
  ownerTag: string;
  type: 'trial' | 'lifetime' | 'subscription';
  duration?: number; // duration in ms
  maxIps: number;
}

export function useLicensesQuery(filters: {
  page?: number;
  limit?: number;
  status?: string;
  pluginId?: string;
  ownerTag?: string;
}) {
  return useQuery<LicensesResponse>({
    queryKey: queryKeys.licenses(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.pluginId && filters.pluginId !== 'ALL') params.append('pluginId', filters.pluginId);
      if (filters.ownerTag) params.append('ownerTag', filters.ownerTag);

      return apiFetch<LicensesResponse>(`/api/v1/admin/licenses?${params.toString()}`);
    },
  });
}

export function useLicenseDetailQuery(key: string) {
  return useQuery<LicenseDetailResponse>({
    queryKey: queryKeys.license(key),
    queryFn: () => apiFetch<LicenseDetailResponse>(`/api/v1/admin/licenses/${key}`),
    enabled: !!key,
  });
}

export function useCreateLicenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, CreateLicenseInput>({
    mutationFn: (data) =>
      apiFetch<LicenseData>('/api/v1/admin/licenses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useSuspendLicenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, { key: string; reason: string }>({
    mutationFn: ({ key, reason }) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['license', variables.key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useRevokeLicenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, { key: string; reason: string }>({
    mutationFn: ({ key, reason }) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/revoke`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['license', variables.key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useReactivateLicenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, { key: string; reason: string }>({
    mutationFn: ({ key, reason }) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/reactivate`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['license', variables.key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useTransferLicenseMutation() {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, { key: string; ownerId: string; ownerTag: string }>({
    mutationFn: ({ key, ownerId, ownerTag }) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ ownerId, ownerTag }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['license', variables.key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useHwidResetMutation(key: string) {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, void>({
    mutationFn: () =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/hwid-reset`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateIpsMutation(key: string) {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, string[]>({
    mutationFn: (ips) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/ips`, {
        method: 'PUT',
        body: JSON.stringify({ ips }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateMaxIpsMutation(key: string) {
  const queryClient = useQueryClient();
  return useMutation<LicenseData, Error, number>({
    mutationFn: (maxIps) =>
      apiFetch<LicenseData>(`/api/v1/admin/licenses/${key}/max-ips`, {
        method: 'PUT',
        body: JSON.stringify({ maxIps }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['license', key] });
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function usePluginsQuery() {
  return useQuery<PluginInfo[]>({
    queryKey: queryKeys.plugins(),
    queryFn: () => apiFetch<PluginInfo[]>('/api/v1/admin/plugins'),
  });
}

export function useCreatePluginMutation() {
  const queryClient = useQueryClient();
  return useMutation<PluginInfo, Error, { name: string; slug: string; version?: string; description?: string }>({
    mutationFn: (data) =>
      apiFetch<PluginInfo>('/api/v1/admin/plugins', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
