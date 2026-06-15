'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLicensesQuery, usePluginsQuery, useTransferLicenseMutation, LicenseData } from '@/hooks/useLicenses';
import LicenseTable from '@/components/license/LicenseTable';
import GenerateLicenseForm from '@/components/license/GenerateLicenseForm';
import { toast } from 'sonner';

function LicensesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const status = searchParams.get('status') || 'ALL';
  const pluginId = searchParams.get('pluginId') || 'ALL';
  const ownerTag = searchParams.get('ownerTag') || '';

  // Slide-over & Modal States
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [transferringLicense, setTransferringLicense] = useState<LicenseData | null>(null);
  const [transferOwnerId, setTransferOwnerId] = useState('');
  const [transferOwnerTag, setTransferOwnerTag] = useState('');

  // Queries
  const { data, isLoading } = useLicensesQuery({
    page,
    limit,
    status,
    pluginId,
    ownerTag,
  });

  const { data: plugins = [] } = usePluginsQuery();

  // Mutations
  const transferMutation = useTransferLicenseMutation();

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
    if (!('page' in newFilters)) {
      params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferringLicense) return;

    if (!transferOwnerId.trim() || !transferOwnerTag.trim()) {
      toast.error('Discord User ID and Username are required');
      return;
    }

    if (!/^[a-z0-9_.]+$/.test(transferOwnerTag.trim()) || transferOwnerTag.trim().length < 2 || transferOwnerTag.trim().length > 32) {
      toast.error('Must be a valid Discord username (2-32 chars, lowercase, alphanumeric, underscores, or periods)');
      return;
    }

    if (!/^\d{17,20}$/.test(transferOwnerId.trim())) {
      toast.error('Invalid Discord ID format');
      return;
    }

    transferMutation.mutate(
      { key: transferringLicense.key, ownerId: transferOwnerId.trim(), ownerTag: transferOwnerTag.trim() },
      {
        onSuccess: () => {
          toast.success('License transferred successfully');
          setTransferringLicense(null);
          setTransferOwnerId('');
          setTransferOwnerTag('');
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to transfer license');
        },
      },
    );
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by username..."
            value={ownerTag}
            onChange={(e) => updateFilters({ ownerTag: e.target.value })}
            className="flat-input pl-9 w-full text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Status select */}
          <select
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="flat-input text-xs bg-zinc-950 min-w-[120px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">ACTIVE</option>
            <option value="suspended">SUSPENDED</option>
            <option value="revoked">REVOKED</option>
            <option value="expired">EXPIRED</option>
          </select>

          {/* Plugin select */}
          <select
            value={pluginId}
            onChange={(e) => updateFilters({ pluginId: e.target.value })}
            className="flat-input text-xs bg-zinc-950 min-w-[150px]"
          >
            <option value="ALL">All Plugins</option>
            {plugins.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Generate Button */}
          <button
            onClick={() => setIsSlideOverOpen(true)}
            className="flat-btn flat-btn-primary gap-2 text-xs uppercase tracking-wider py-2"
          >
            <Plus className="w-4 h-4" />
            Generate License
          </button>
        </div>
      </div>

      {/* License Table */}
      <LicenseTable
        data={data?.licenses || []}
        isLoading={isLoading}
        onTransferClick={(license) => setTransferringLicense(license)}
      />

      {/* Pagination Controls */}
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

      {/* Slide-Over Panel for Generating License */}
      {isSlideOverOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 z-40 transition-opacity"
            onClick={() => setIsSlideOverOpen(false)}
          />
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-card z-50 shadow-2xl border-l border-border transition-transform duration-200">
            <GenerateLicenseForm
              plugins={plugins}
              onClose={() => setIsSlideOverOpen(false)}
            />
          </div>
        </>
      )}

      {/* Transfer License Modal */}
      {transferringLicense && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 z-40"
            onClick={() => setTransferringLicense(null)}
          />
          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md flat-card bg-card border border-border p-6 z-50 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2">
              Transfer License Ownership
            </h3>
            <p className="text-xs text-zinc-500">
              Transferring ownership resets the hardware lock (HWID) and whitelisted IPs for key{' '}
              <span className="font-mono text-zinc-400">••••••••{transferringLicense.key.slice(-8)}</span>.
            </p>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
                  New Owner Discord ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789012345678"
                  value={transferOwnerId}
                  onChange={(e) => setTransferOwnerId(e.target.value)}
                  className="flat-input text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
                  New Owner Discord Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. lowercase_username"
                  value={transferOwnerTag}
                  onChange={(e) => setTransferOwnerTag(e.target.value)}
                  className="flat-input text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="flat-btn flat-btn-primary flex-1 text-xs uppercase tracking-wider py-2 disabled:opacity-50"
                >
                  {transferMutation.isPending ? 'Transferring...' : 'Execute Transfer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTransferringLicense(null);
                    setTransferOwnerId('');
                    setTransferOwnerTag('');
                  }}
                  className="flat-btn flat-btn-secondary flex-1 text-xs uppercase tracking-wider py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function LicensesPageFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="h-10 w-80 bg-zinc-800 rounded animate-pulse" />
        <div className="h-10 w-48 bg-zinc-800 rounded animate-pulse" />
      </div>
      <div className="flat-card bg-card h-96 animate-pulse" />
    </div>
  );
}

export default function LicensesPage() {
  return (
    <Suspense fallback={<LicensesPageFallback />}>
      <LicensesPageContent />
    </Suspense>
  );
}
