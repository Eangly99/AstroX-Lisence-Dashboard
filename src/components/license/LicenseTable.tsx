'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Copy,
  MoreVertical,
  ShieldAlert,
  Ban,
  RefreshCw,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LicenseData } from '@/hooks/useLicenses';
import LicenseStatusBadge from './LicenseStatusBadge';
import {
  useSuspendLicenseMutation,
  useRevokeLicenseMutation,
  useReactivateLicenseMutation,
} from '@/hooks/useLicenses';

interface LicenseTableProps {
  data: LicenseData[];
  onTransferClick: (license: LicenseData) => void;
  isLoading: boolean;
}

export default function LicenseTable({ data, onTransferClick, isLoading }: LicenseTableProps) {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Mutations
  const suspendMutation = useSuspendLicenseMutation();
  const revokeMutation = useRevokeLicenseMutation();
  const reactivateMutation = useReactivateLicenseMutation();

  const handleCopy = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    toast.success('License key copied to clipboard');
  };

  const handleAction = useCallback(async (
    e: React.MouseEvent,
    action: 'suspend' | 'revoke' | 'reactivate',
    license: LicenseData,
  ) => {
    e.stopPropagation();
    setActiveDropdown(null);

    const promise = new Promise((resolve, reject) => {
      const callbacks = {
        onSuccess: () => resolve(true),
        onError: (err: Error) => reject(err),
      };

      if (action === 'suspend') {
        suspendMutation.mutate({ key: license.key, reason: 'Suspended by admin' }, {
          onSuccess: callbacks.onSuccess,
          onError: callbacks.onError,
        });
      } else if (action === 'revoke') {
        revokeMutation.mutate({ key: license.key, reason: 'Revoked by admin' }, {
          onSuccess: callbacks.onSuccess,
          onError: callbacks.onError,
        });
      } else if (action === 'reactivate') {
        reactivateMutation.mutate({ key: license.key, reason: 'Reactivated by admin' }, {
          onSuccess: callbacks.onSuccess,
          onError: callbacks.onError,
        });
      }
    });

    toast.promise(promise, {
      loading: `${action.charAt(0).toUpperCase() + action.slice(1)}ing license...`,
      success: `License successfully ${action}d`,
      error: (err) => err.message || `Failed to ${action} license`,
    });
  }, [suspendMutation, revokeMutation, reactivateMutation]);

  // Keyboard navigation
  useEffect(() => {
    if (focusedRowIndex !== null && rowRefs.current[focusedRowIndex]) {
      rowRefs.current[focusedRowIndex]?.focus();
    }
  }, [focusedRowIndex]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number, key: string) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, data.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      router.push(`/licenses/${key}`);
    }
  };

  const columns = React.useMemo<ColumnDef<LicenseData>[]>(
    () => [
      {
        header: 'License Key',
        accessorKey: 'key',
        cell: ({ getValue }) => {
          const key = getValue<string>();
          return (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-zinc-400">••••••••{key.slice(-8)}</span>
              <button
                onClick={(e) => handleCopy(e, key)}
                className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150 p-1 hover:bg-zinc-800 rounded"
                title="Copy full key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
      {
        header: 'Plugin',
        accessorKey: 'pluginId',
        cell: ({ getValue }) => {
          const plugin = getValue<unknown>() as { name?: string } | null;
          return <span className="font-semibold text-white">{plugin?.name || 'Unknown'}</span>;
        },
      },
      {
        header: 'Owner',
        accessorKey: 'ownerTag',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-zinc-200">{row.original.ownerTag}</span>
            <span className="text-xxs text-zinc-500 font-mono">{row.original.ownerId}</span>
          </div>
        ),
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ getValue }) => (
          <span className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
            {getValue<string>()}
          </span>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <LicenseStatusBadge status={getValue<string>()} />,
      },
      {
        header: 'Allowed IPs',
        accessorKey: 'allowedIps',
        cell: ({ row }) => (
          <div className="text-xs font-mono text-zinc-400">
            {row.original.allowedIps.length} / {row.original.maxIps}
          </div>
        ),
      },
      {
        header: 'HWID',
        accessorKey: 'hwid',
        cell: ({ getValue }) => {
          const hwid = getValue<string | null>();
          return hwid ? (
            <span className="text-xs font-mono text-zinc-500">••••••••{hwid.slice(-6)}</span>
          ) : (
            <span className="text-xs italic text-zinc-600">Unbound</span>
          );
        },
      },
      {
        header: 'Expires At',
        accessorKey: 'expiresAt',
        cell: ({ getValue }) => {
          const date = getValue<string | null>();
          return (
            <span className="text-xs text-zinc-400">
              {date ? format(new Date(date), 'yyyy-MM-dd HH:mm') : 'Never'}
            </span>
          );
        },
      },
      {
        header: 'Last Validated',
        accessorKey: 'lastValidatedAt',
        cell: ({ getValue }) => {
          const date = getValue<string | null>();
          return (
            <span className="text-xs text-zinc-400">
              {date ? format(new Date(date), 'yyyy-MM-dd HH:mm') : 'Never'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const license = row.original;
          const isOpen = activeDropdown === license._id;

          return (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(isOpen ? null : license._id);
                }}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 hover:bg-zinc-800 rounded transition-colors duration-150 cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(null);
                    }}
                  />
                  <div className="absolute right-0 mt-1.5 w-44 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/85 z-20 overflow-hidden py-1">
                    <button
                      onClick={() => {
                        setActiveDropdown(null);
                        router.push(`/licenses/${license.key}`);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    {license.status !== 'suspended' && license.status !== 'revoked' && (
                      <button
                        onClick={(e) => handleAction(e, 'suspend', license)}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-amber-400 hover:bg-white/5 hover:text-amber-300 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Suspend
                      </button>
                    )}
                    {license.status === 'suspended' && (
                      <button
                        onClick={(e) => handleAction(e, 'reactivate', license)}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-white/5 hover:text-emerald-300 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reactivate
                      </button>
                    )}
                    {license.status !== 'revoked' && (
                      <button
                        onClick={(e) => handleAction(e, 'revoke', license)}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-white/5 hover:text-rose-300 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(null);
                        onTransferClick(license);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-sky-400 hover:bg-white/5 hover:text-sky-300 flex items-center gap-2.5 transition-colors duration-150 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Transfer License
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [activeDropdown, handleAction, onTransferClick, router],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto flat-card">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-white/5 bg-zinc-950/45">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-xxs font-bold text-zinc-500 uppercase tracking-widest font-mono"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-white/[0.03] bg-zinc-900/10">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="h-16">
                <td colSpan={10} className="px-4 py-3">
                  <div className="h-4 bg-zinc-800/40 rounded animate-pulse w-full" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-8 text-center text-sm text-zinc-500 font-sans">
                No licenses found matching current filters.
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
                onKeyDown={(e) => handleKeyDown(e, idx, row.original.key)}
                onClick={() => router.push(`/licenses/${row.original.key}`)}
                className={`h-16 hover:bg-white/[0.02] focus:bg-white/[0.04] cursor-pointer outline-none transition-all duration-150 border-b border-white/[0.02] ${
                  focusedRowIndex === idx ? 'bg-white/[0.03]' : ''
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
