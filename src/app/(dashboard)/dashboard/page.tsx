'use client';

import React from 'react';
import {
  Key,
  ShieldCheck,
  Ban,
  ShieldAlert,
  Hourglass,
  Scroll,
} from 'lucide-react';
import { useStatsQuery } from '@/hooks/useStats';
import StatCard from '@/components/layout/StatCard';
import StatusDonut from '@/components/charts/StatusDonut';
import PluginBar from '@/components/charts/PluginBar';
import TypeBar from '@/components/charts/TypeBar';
import ActionBadge from '@/components/audit/ActionBadge';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useStatsQuery();

  if (isError) {
    return (
      <div className="p-6 flat-card border border-rose-500/20 bg-rose-500/5 text-rose-400">
        <h3 className="font-bold text-lg">Failed to retrieve system statistics</h3>
        <p className="text-sm mt-1">{error?.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flat-card p-4 h-28 bg-card animate-pulse space-y-4">
              <div className="flex justify-between">
                <div className="h-3 bg-zinc-800 rounded w-20" />
                <div className="h-6 w-6 bg-zinc-800 rounded" />
              </div>
              <div className="h-7 bg-zinc-800 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flat-card p-6 bg-card h-[320px] animate-pulse space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-40 bg-zinc-800 rounded w-full mt-8" />
            </div>
          ))}
        </div>

        {/* Audit Log Skeleton */}
        <div className="flat-card p-6 bg-card animate-pulse space-y-4">
          <div className="h-4 bg-zinc-800 rounded w-1/4" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/50">
                <div className="h-4 bg-zinc-800 rounded w-1/3" />
                <div className="h-4 bg-zinc-800 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Licenses"
          value={data.total}
          delta={data.deltas.total}
          icon={Key}
        />
        <StatCard
          title="Active"
          value={data.active}
          delta={data.deltas.active}
          icon={ShieldCheck}
        />
        <StatCard
          title="Suspended"
          value={data.suspended}
          delta={data.deltas.suspended}
          icon={Ban}
        />
        <StatCard
          title="Revoked"
          value={data.revoked}
          delta={data.deltas.revoked}
          icon={ShieldAlert}
        />
        <StatCard
          title="Expired"
          value={data.expired}
          delta={data.deltas.expired}
          icon={Hourglass}
        />
      </div>

      {/* Recharts Data Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status distribution */}
        <div className="flat-card p-6 bg-card flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2">
            Status Distribution
          </h3>
          <div className="flex-1 mt-4">
            <StatusDonut data={data} />
          </div>
        </div>

        {/* Licenses per Plugin */}
        <div className="flat-card p-6 bg-card flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2">
            Plugin Distribution
          </h3>
          <div className="flex-1 mt-4">
            <PluginBar data={data.plugins} />
          </div>
        </div>

        {/* License Type Breakdown */}
        <div className="flat-card p-6 bg-card flex flex-col justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2">
            License Types (LIFETIME vs TIMED)
          </h3>
          <div className="flex-1 mt-4">
            <TypeBar types={data.types} />
          </div>
        </div>
      </div>

      {/* Recent AuditLog Feed */}
      <div className="flat-card p-6 bg-card">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
          <Scroll className="w-4 h-4 text-zinc-500" />
          Recent Audit Ledger Feed
        </h3>

        <div className="mt-4 divide-y divide-border/60">
          {data.recentLogs.length === 0 ? (
            <p className="text-sm text-zinc-500 py-4 italic">No audit records exist.</p>
          ) : (
            data.recentLogs.map((log) => (
              <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <ActionBadge action={log.action} />
                  <span className="text-zinc-300 font-medium select-all font-mono text-xs">
                    {log.targetKey || 'N/A'}
                  </span>
                  <span className="hidden sm:inline text-zinc-600">|</span>
                  <span className="text-zinc-500 text-xs">
                    Actor: <span className="font-mono">{log.actorId}</span>
                  </span>
                </div>
                <span className="text-xxs font-mono text-zinc-500">
                  {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
