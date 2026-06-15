'use client';

import React, { useState } from 'react';
import { useBlacklistQuery } from '@/hooks/useBlacklist';
import BlacklistTable from '@/components/blacklist/BlacklistTable';
import AddBlacklistForm from '@/components/blacklist/AddBlacklistForm';

export default function BlacklistPage() {
  const [filterType, setFilterType] = useState('ALL');

  const { data = [], isLoading } = useBlacklistQuery(filterType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Blacklist List (Left) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filter bar */}
        <div className="flex justify-between items-center bg-card border border-border p-3 rounded">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Enforced Rules
          </span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flat-input text-xs bg-zinc-950 min-w-[140px]"
          >
            <option value="ALL">All Blocks</option>
            <option value="ip">IP Address Blocks</option>
            <option value="key">License Key Blocks</option>
            <option value="hwid">Hardware ID Blocks</option>
          </select>
        </div>

        {/* Table */}
        <BlacklistTable data={data} isLoading={isLoading} />
      </div>

      {/* Add to Blacklist Form (Right) */}
      <div className="space-y-4">
        <AddBlacklistForm />
      </div>
    </div>
  );
}
