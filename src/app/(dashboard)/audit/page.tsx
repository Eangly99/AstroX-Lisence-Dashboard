'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useAuditLogQuery } from '@/hooks/useAuditLog';
import AuditLogTable from '@/components/audit/AuditLogTable';

function AuditPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const action = searchParams.get('action') || 'ALL';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // Query
  const { data, isLoading } = useAuditLogQuery({
    page,
    limit,
    action,
    startDate,
    endDate,
  });

  const updateFilters = (newFilters: Record<string, string | number>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === 'ALL' || val === '') {
        params.delete(key);
      } else {
        params.set(key, val.toString());
      }
    });
    // Reset page on filter changes unless changing page directly
    if (!newFilters.page && newFilters.page !== 1) {
      params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flat-card p-4 bg-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Action Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={action}
              onChange={(e) => updateFilters({ action: e.target.value })}
              className="flat-input text-xs bg-zinc-950 min-w-[150px]"
            >
              <option value="ALL">All Actions</option>
              <option value="generate">GENERATE</option>
              <option value="suspend">SUSPEND</option>
              <option value="revoke">REVOKE</option>
              <option value="reactivate">REACTIVATE</option>
              <option value="expire">EXPIRE</option>
              <option value="transfer">TRANSFER</option>
              <option value="update_ips">UPDATE IPS</option>
              <option value="blacklist_add">BLACKLIST ADD</option>
              <option value="blacklist_remove">BLACKLIST REMOVE</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
              className="flat-input text-xs bg-zinc-950 font-mono py-1.5"
            />
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
              className="flat-input text-xs bg-zinc-950 font-mono py-1.5"
            />
          </div>
        </div>

        {/* Reset */}
        {(action !== 'ALL' || startDate || endDate) && (
          <button
            onClick={handleResetFilters}
            className="w-full md:w-auto flat-btn flat-btn-secondary text-xs uppercase tracking-wider py-1.5"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <AuditLogTable data={data?.logs || []} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            Showing Page <span className="text-zinc-300 font-bold">{data.page}</span> of{' '}
            <span className="text-zinc-300 font-bold">{data.totalPages}</span> ({data.total} total)
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => updateFilters({ page: data.page - 1 })}
              disabled={data.page <= 1}
              className="flat-btn flat-btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateFilters({ page: data.page + 1 })}
              disabled={data.page >= data.totalPages}
              className="flat-btn flat-btn-secondary p-2 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditPageFallback() {
  return (
    <div className="space-y-6">
      <div className="flat-card p-4 bg-card h-16 animate-pulse" />
      <div className="flat-card bg-card h-96 animate-pulse" />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<AuditPageFallback />}>
      <AuditPageContent />
    </Suspense>
  );
}
