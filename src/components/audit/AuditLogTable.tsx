'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AuditLogData } from '@/hooks/useAuditLog';
import ActionBadge from './ActionBadge';

interface AuditLogTableProps {
  data: AuditLogData[];
  isLoading: boolean;
}

export default function AuditLogTable({ data, isLoading }: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    toast.success('License key copied to clipboard');
  };

  // Keyboard navigation
  useEffect(() => {
    if (focusedRowIndex !== null && rowRefs.current[focusedRowIndex]) {
      rowRefs.current[focusedRowIndex]?.focus();
    }
  }, [focusedRowIndex]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, id: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, data.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      toggleRow(id);
    }
  };

  const columns = React.useMemo<ColumnDef<AuditLogData>[]>(
    () => [
      {
        id: 'expander',
        cell: ({ row }) => {
          const isExpanded = expandedRows[row.original.id];
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleRow(row.original.id);
              }}
              className="text-zinc-500 hover:text-zinc-300 p-1"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          );
        },
      },
      {
        header: 'Timestamp',
        accessorKey: 'timestamp',
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-zinc-400">
            {format(new Date(getValue<string>()), 'yyyy-MM-dd HH:mm:ss')}
          </span>
        ),
      },
      {
        header: 'Action',
        accessorKey: 'action',
        cell: ({ getValue }) => <ActionBadge action={getValue<string>()} />,
      },
      {
        header: 'Actor ID',
        accessorKey: 'actorId',
        cell: ({ getValue }) => (
          <span className="text-xs font-mono text-zinc-400">{getValue<string>()}</span>
        ),
      },
      {
        header: 'Target Key',
        accessorKey: 'targetKey',
        cell: ({ getValue }) => {
          const key = getValue<string | null>();
          return key ? (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-500">{key}</span>
              <button
                onClick={(e) => handleCopy(e, key)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150 p-1 hover:bg-zinc-800 rounded"
                title="Copy target key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-zinc-600 italic">None</span>
          );
        },
      },
      {
        header: 'Overview',
        id: 'overview',
        cell: ({ row }) => {
          const { action, details } = row.original;
          const d = details as Record<string, string>;
          const getSummary = (): string => {
            switch (action.toLowerCase()) {
              case 'generate':
                return `Generated key for ${d.ownerTag || 'unknown owner'}`;
              case 'suspend':
                return `Suspended key. Reason: ${d.reason || 'No reason'}`;
              case 'revoke':
                return `Revoked key. Reason: ${d.reason || 'No reason'}`;
              case 'reactivate':
                return `Reactivated key`;
              case 'transfer':
                return `Transferred ownership to ${d.newOwnerTag || 'unknown'}`;
              case 'update_ips':
                return `Updated Whitelisted IPs`;
              case 'blacklist_add':
                return `Blocked ${d.type} (${d.value})`;
              case 'blacklist_remove':
                return `Unblocked ${d.type} (${d.value})`;
              default:
                return d.reason || 'Audit entry recorded';
            }
          };
          return (
            <span className="text-xs text-zinc-400 font-medium line-clamp-1 max-w-[300px]">
              {getSummary()}
            </span>
          );
        },
      },
    ],
    [expandedRows],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto flat-card">
      <table className="w-full text-left border-collapse min-w-[900px]">
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
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="h-14">
                <td colSpan={6} className="px-4 py-3">
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-full" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-500">
                No logs recorded.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, idx) => {
              const rowId = row.original.id;
              const isExpanded = expandedRows[rowId];
              return (
                <React.Fragment key={row.id}>
                  <tr
                    ref={(el) => {
                      rowRefs.current[idx] = el;
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, idx, rowId)}
                    onClick={() => toggleRow(rowId)}
                    className={`h-14 hover:bg-zinc-800/10 focus:bg-zinc-800/30 cursor-pointer outline-none transition-colors duration-150 ${
                      focusedRowIndex === idx ? 'bg-zinc-800/20' : ''
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-zinc-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr className="bg-zinc-950/40">
                      <td colSpan={6} className="px-12 py-3 border-t border-b border-border/50">
                        <pre className="text-xxs font-mono text-zinc-400 bg-zinc-950 p-3 border border-border/60 rounded overflow-x-auto max-w-[800px]">
                          {JSON.stringify(row.original.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
