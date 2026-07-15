// NOTE: Keep in sync with bot constants in cipher-bot/src/utils/constants.js
export const LICENSE_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const;

export type LicenseStatus = typeof LICENSE_STATUS[keyof typeof LICENSE_STATUS];

export const LICENSE_TYPES = {
  TRIAL: 'trial',
  LIFETIME: 'lifetime',
  SUBSCRIPTION: 'subscription',
} as const;

export type LicenseType = typeof LICENSE_TYPES[keyof typeof LICENSE_TYPES];

export const AUDIT_ACTIONS = {
  GENERATE: 'generate',
  VERIFY: 'verify',
  REVOKE: 'revoke',
  TRANSFER: 'transfer',
  SUSPEND: 'suspend',
  REACTIVATE: 'reactivate',
  BLACKLIST_ADD: 'blacklist_add',
  BLACKLIST_REMOVE: 'blacklist_remove',
  UPDATE_IPS: 'update_ips',
  UPDATE_MAX_IPS: 'update_max_ips',
  UPDATE_MAX_SERVERS_PER_IP: 'update_max_servers_per_ip',
  EXPIRE: 'expire',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

export const BLACKLIST_TYPES = {
  KEY: 'key',
  HWID: 'hwid',
  IP: 'ip',
} as const;

export type BlacklistType = typeof BLACKLIST_TYPES[keyof typeof BLACKLIST_TYPES];
