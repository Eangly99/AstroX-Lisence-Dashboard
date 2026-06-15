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
    if (!delta) return 'text-zinc-500';
    return delta > 0 ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' : 'text-rose-500 bg-rose-500/5 border-rose-500/10';
  };

  const TrendIcon = !delta ? Minus : delta > 0 ? TrendingUp : TrendingDown;

  return (
    <div className="flat-card p-4 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
          {title}
        </span>
        <div className="p-1.5 rounded bg-zinc-800 border border-border">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        
        {delta !== undefined && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${getTrendColor()}`}>
            <TrendIcon className="w-3.5 h-3.5" />
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
