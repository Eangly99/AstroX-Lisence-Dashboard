import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: number; // Delta percentage, e.g. +12.5 or -5.2
  icon: LucideIcon;
}

export default function StatCard({ title, value, delta, icon: Icon }: StatCardProps) {
  const getTrendColor = () => {
    if (!delta) return 'text-zinc-500 border-zinc-800 bg-zinc-800/20';
    return delta > 0 
      ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20' 
      : 'text-rose-400 bg-rose-500/5 border-rose-500/20';
  };

  const getCardTheme = () => {
    const t = title.toLowerCase();
    if (t.includes('total')) {
      return {
        bg: 'from-violet-500/5 to-transparent',
        border: 'hover:border-violet-500/20',
        shadow: 'hover:shadow-[0_0_25px_rgba(124,58,237,0.06)]',
        iconBg: 'bg-violet-500/10 border-violet-500/20 text-violet-400'
      };
    }
    if (t.includes('active')) {
      return {
        bg: 'from-emerald-500/5 to-transparent',
        border: 'hover:border-emerald-500/20',
        shadow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.06)]',
        iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      };
    }
    if (t.includes('suspended')) {
      return {
        bg: 'from-amber-500/5 to-transparent',
        border: 'hover:border-amber-500/20',
        shadow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.06)]',
        iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      };
    }
    if (t.includes('revoked')) {
      return {
        bg: 'from-rose-500/5 to-transparent',
        border: 'hover:border-rose-500/20',
        shadow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.06)]',
        iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
      };
    }
    return {
      bg: 'from-zinc-500/5 to-transparent',
      border: 'hover:border-zinc-500/20',
      shadow: 'hover:shadow-[0_0_25px_rgba(113,113,122,0.06)]',
      iconBg: 'bg-zinc-800/40 border-zinc-700/50 text-zinc-400'
    };
  };

  const TrendIcon = !delta ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const theme = getCardTheme();

  return (
    <div className={`flat-card p-5 flex flex-col justify-between min-h-[125px] bg-gradient-to-b ${theme.bg} ${theme.border} ${theme.shadow} transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-900/40 cursor-pointer`}>
      <div className="flex items-center justify-between">
        <span className="text-xxs font-bold text-zinc-500 tracking-wider uppercase font-mono">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${theme.iconBg} transition-colors duration-150`}>
          <Icon className="w-4 h-4 animate-pulse-subtle" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white font-mono select-all">{value}</span>
        
        {delta !== undefined && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span>
              {delta > 0 ? '+' : ''}
              {delta}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

