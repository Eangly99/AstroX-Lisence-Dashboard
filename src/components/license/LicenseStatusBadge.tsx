import React from 'react';
import { LICENSE_STATUS, LicenseStatus } from '@/lib/constants';

interface LicenseStatusBadgeProps {
  status: LicenseStatus | string;
}

export default function LicenseStatusBadge({ status }: LicenseStatusBadgeProps) {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case LICENSE_STATUS.ACTIVE:
        return {
          wrapper: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
          dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
        };
      case LICENSE_STATUS.SUSPENDED:
        return {
          wrapper: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
          dot: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
        };
      case LICENSE_STATUS.REVOKED:
        return {
          wrapper: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
          dot: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
        };
      case LICENSE_STATUS.EXPIRED:
        return {
          wrapper: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 shadow-none',
          dot: 'bg-zinc-500'
        };
      default:
        return {
          wrapper: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          dot: 'bg-zinc-600'
        };
    }
  };

  const styles = getStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border tracking-wider font-mono ${styles.wrapper}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
}

