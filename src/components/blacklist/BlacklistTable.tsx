'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Trash2, Copy, ShieldAlert, Key, Monitor, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BlacklistEntry, useRemoveBlacklistMutation } from '@/hooks/useBlacklist';

interface BlacklistTableProps {
  data: BlacklistEntry[];
  isLoading: boolean;
}

export default function BlacklistTable({ data, isLoading }: BlacklistTableProps) {
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const removeMutation = useRemoveBlacklistMutation();

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleRemove = useCallback((e: React.MouseEvent, entry: BlacklistEntry) => {
    e.stopPropagation();
    
    const promise = new Promise((resolve, reject) => {
      removeMutation.mutate(
        { type: entry.type, value: entry.value },
        {
          onSuccess: () => resolve(true),
          onError: (err) => reject(err),
        },
      );
    });

    toast.promise(promise, {
      loading: 'Removing entity from blacklist...',
      success: 'Entity removed from blacklist',
      error: (err) => err.message || 'Failed to remove from blacklist',
    });
  }, [removeMutation]);

  // Keyboard navigation
  useEffect(() => {
    if (focusedRowIndex !== null && rowRefs.current[focusedRowIndex]) {
      rowRefs.current[focusedRowIndex]?.focus();
    }
  }, [focusedRowIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, data.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
    }
  };

  const columns = React.useMemo<ColumnDef<BlacklistEntry>[]>(
    () => [
      {
        header: 'Block Type',
        accessorKey: 'type',
        cell: ({ getValue }) => {
          const type = getValue<'key' | 'hwid' | 'ip'>();
          const getStyles = () => {
            switch (type) {
              case 'key':
                return { badge: 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20', icon: Key };
              case 'hwid':
                return { badge: 'bg-amber-500/5 text-amber-400 border-amber-500/20', icon: Monitor };
              case 'ip':
                return { badge: 'bg-sky-500/5 text-sky-400 border-sky-500/20', icon: Globe };
              default:
                return { badge: 'bg-zinc-800 text-zinc-400 border-zinc-700', icon: ShieldAlert };
            }
          };

          const styles = getStyles();
          const Icon = styles.icon;

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold uppercase border tracking-wider ${styles.badge}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {type}
            </span>
          );
        },
      },
      {
        header: 'Target Value',
        accessorKey: 'value',
        cell: ({ row }) => {
          const { type, value } = row.original;
          const maskedValue =
            type === 'ip' ? value : `••••••••${value.slice(-12)}`;

          return (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-300">{maskedValue}</span>
              <button
                onClick={(e) => handleCopy(e, value)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150 p-1 hover:bg-zinc-800 rounded"
                title="Copy value"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
      {
        header: 'Reason',
        accessorKey: 'reason',
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-400 font-medium line-clamp-1 max-w-[300px]">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Added By',
        accessorKey: 'addedBy',
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-zinc-500">{getValue<string>()}</span>
        ),
      },
      {
        header: 'Blocked On',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <span className="text-xs text-zinc-400">
            {format(new Date(getValue<string>()), 'yyyy-MM-dd HH:mm')}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <button
            onClick={(e) => handleRemove(e, row.original)}
            disabled={removeMutation.isPending}
            className="text-zinc-500 hover:text-rose-400 p-1.5 hover:bg-zinc-800 rounded transition-colors duration-150"
            title="Remove from blacklist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ),
      },
    ],
    [handleRemove, removeMutation.isPending],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto flat-card">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-border bg-zinc-900/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <tr key={idx} className="h-14">
                <td colSpan={6} className="px-4 py-3">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-full" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">
                No active blacklist entries.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e)}
                className={`h-14 hover:bg-zinc-800/10 focus:bg-zinc-800/30 outline-none transition-colors duration-150 ${
                  focusedRowIndex === idx ? 'bg-zinc-800/20' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-zinc-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
