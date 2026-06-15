export const queryKeys = {
  stats: () => ['stats'] as const,
  licenses: (filters: Record<string, unknown>) => ['licenses', filters] as const,
  license: (key: string) => ['license', key] as const,
  plugins: () => ['plugins'] as const,
  blacklist: (type?: string) => ['blacklist', { type }] as const,
  auditLog: (filters: Record<string, unknown>) => ['auditLog', filters] as const,
};
