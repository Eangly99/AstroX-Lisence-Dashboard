import React from 'react';
import { LICENSE_STATUS, LicenseStatus } from '@/lib/constants';

interface LicenseStatusBadgeProps {
  status: LicenseStatus | string;
}

export default function LicenseStatusBadge({ status }: LicenseStatusBadgeProps) {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case LICENSE_STATUS.ACTIVE:
        return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20';
      case LICENSE_STATUS.SUSPENDED:
        return 'bg-amber-500/5 text-amber-400 border-amber-500/20';
      case LICENSE_STATUS.REVOKED:
        return 'bg-rose-500/5 text-rose-400 border-rose-500/20';
      case LICENSE_STATUS.EXPIRED:
        return 'bg-zinc-500/5 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border tracking-wider ${getStyles()}`}>
      {status}
    </span>
  );
}
