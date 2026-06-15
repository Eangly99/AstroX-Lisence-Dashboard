import React from 'react';
import { AUDIT_ACTIONS } from '@/lib/constants';

interface ActionBadgeProps {
  action: string;
}

export default function ActionBadge({ action }: ActionBadgeProps) {
  const getColors = () => {
    switch (action.toLowerCase()) {
      case AUDIT_ACTIONS.GENERATE:
        return 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20';
      case AUDIT_ACTIONS.REVOKE:
        return 'bg-rose-500/5 text-rose-400 border-rose-500/20';
      case AUDIT_ACTIONS.SUSPEND:
        return 'bg-amber-500/5 text-amber-400 border-amber-500/20';
      case AUDIT_ACTIONS.REACTIVATE:
        return 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20';
      case AUDIT_ACTIONS.EXPIRE:
        return 'bg-zinc-500/5 text-zinc-400 border-zinc-500/20';
      case AUDIT_ACTIONS.TRANSFER:
        return 'bg-sky-500/5 text-sky-400 border-sky-500/20';
      case AUDIT_ACTIONS.UPDATE_IPS:
        return 'bg-violet-500/5 text-violet-400 border-violet-500/20';
      case AUDIT_ACTIONS.BLACKLIST_ADD:
        return 'bg-rose-600/5 text-rose-300 border-rose-600/20';
      case AUDIT_ACTIONS.BLACKLIST_REMOVE:
        return 'bg-emerald-600/5 text-emerald-300 border-emerald-600/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border tracking-wider ${getColors()}`}>
      {action.replace('_', ' ')}
    </span>
  );
}
