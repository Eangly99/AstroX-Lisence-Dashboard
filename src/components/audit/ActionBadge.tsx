import React from 'react';
import { AUDIT_ACTIONS } from '@/lib/constants';

interface ActionBadgeProps {
  action: string;
}

export default function ActionBadge({ action }: ActionBadgeProps) {
  const getStyles = () => {
    switch (action.toLowerCase()) {
      case AUDIT_ACTIONS.GENERATE:
        return {
          wrapper: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-[0_0_8px_rgba(99,102,241,0.1)]',
          dot: 'bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]'
        };
      case AUDIT_ACTIONS.REVOKE:
        return {
          wrapper: 'bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
          dot: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
        };
      case AUDIT_ACTIONS.SUSPEND:
        return {
          wrapper: 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.1)]',
          dot: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
        };
      case AUDIT_ACTIONS.REACTIVATE:
        return {
          wrapper: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
          dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
        };
      case AUDIT_ACTIONS.EXPIRE:
        return {
          wrapper: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 shadow-none',
          dot: 'bg-zinc-500'
        };
      case AUDIT_ACTIONS.TRANSFER:
        return {
          wrapper: 'bg-sky-500/10 text-sky-400 border-sky-500/25 shadow-[0_0_8px_rgba(14,165,233,0.1)]',
          dot: 'bg-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.6)]'
        };
      case AUDIT_ACTIONS.UPDATE_IPS:
        return {
          wrapper: 'bg-violet-500/10 text-violet-400 border-violet-500/25 shadow-[0_0_8px_rgba(139,92,246,0.1)]',
          dot: 'bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]'
        };
      case AUDIT_ACTIONS.BLACKLIST_ADD:
        return {
          wrapper: 'bg-rose-600/10 text-rose-300 border-rose-600/25 shadow-[0_0_8px_rgba(244,63,94,0.1)]',
          dot: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]'
        };
      case AUDIT_ACTIONS.BLACKLIST_REMOVE:
        return {
          wrapper: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/25 shadow-[0_0_8px_rgba(16,185,129,0.1)]',
          dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]'
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
      {action.replace('_', ' ')}
    </span>
  );
}

