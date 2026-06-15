'use client';

import React, { useState } from 'react';
import { Copy, Plus, Trash2, KeyRound, Monitor, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LicenseData, useHwidResetMutation, useUpdateIpsMutation } from '@/hooks/useLicenses';
import LicenseStatusBadge from './LicenseStatusBadge';

interface LicenseDetailCardProps {
  license: LicenseData;
}

const IPV4_REGEX = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;

export default function LicenseDetailCard({ license }: LicenseDetailCardProps) {
  const [newIp, setNewIp] = useState('');
  
  const hwidResetMutation = useHwidResetMutation(license.key);
  const updateIpsMutation = useUpdateIpsMutation(license.key);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Value copied to clipboard');
  };

  const handleHwidReset = () => {
    const promise = new Promise((resolve, reject) => {
      hwidResetMutation.mutate(undefined, {
        onSuccess: () => resolve(true),
        onError: (err) => reject(err),
      });
    });

    toast.promise(promise, {
      loading: 'Resetting Hardware lock...',
      success: 'Hardware ID lock successfully reset',
      error: (err) => err.message || 'Failed to reset Hardware lock',
    });
  };

  const handleAddIp = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newIp.trim();
    if (!trimmed) return;

    if (!IPV4_REGEX.test(trimmed)) {
      toast.error('Invalid IPv4 address format');
      return;
    }

    if (license.allowedIps.includes(trimmed)) {
      toast.error('IP address is already whitelisted');
      return;
    }

    if (license.allowedIps.length >= license.maxIps) {
      toast.error(`IP limit exceeded. Maximum allowed: ${license.maxIps}`);
      return;
    }

    const updatedIps = [...license.allowedIps, trimmed];
    updateIps(updatedIps, 'Adding IP to whitelist...');
  };

  const handleRemoveIp = (ip: string) => {
    const updatedIps = license.allowedIps.filter((item) => item !== ip);
    updateIps(updatedIps, 'Removing IP from whitelist...');
  };

  const updateIps = (ips: string[], loadingMsg: string) => {
    const promise = new Promise((resolve, reject) => {
      updateIpsMutation.mutate(ips, {
        onSuccess: () => {
          setNewIp('');
          resolve(true);
        },
        onError: (err) => reject(err),
      });
    });

    toast.promise(promise, {
      loading: loadingMsg,
      success: 'Whitelisted IPs updated successfully',
      error: (err) => err.message || 'Failed to update whitelisted IPs',
    });
  };

  const formattedDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return format(new Date(dateStr), 'yyyy-MM-dd HH:mm:ss');
  };

  const plugin = typeof license.pluginId === 'object' ? license.pluginId : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side - Core details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Core Metadata Card */}
        <div className="flat-card p-6 bg-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-primary/10 text-primary">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight">License Core</h3>
                <p className="text-xxs text-zinc-500 font-mono select-all">{license._id}</p>
              </div>
            </div>
            <LicenseStatusBadge status={license.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xxs font-semibold text-zinc-500 uppercase tracking-wider">
                License Key
              </span>
              <div className="flex items-center justify-between bg-zinc-950 p-2 border border-border rounded font-mono text-xs">
                <span className="text-zinc-400">••••••••{license.key.slice(-12)}</span>
                <button
                  onClick={() => handleCopy(license.key)}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150 p-1 hover:bg-zinc-800 rounded"
                  title="Copy full key"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Plugin */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xxs font-semibold text-zinc-500 uppercase tracking-wider">
                Plugin Module
              </span>
              <div className="p-2 bg-zinc-950/30 border border-border rounded flex items-center justify-between">
                <span className="font-semibold text-white">{plugin?.name || 'Unknown'}</span>
                <span className="text-xs font-mono text-zinc-500">{plugin?.slug || ''}</span>
              </div>
            </div>

            {/* Owner */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xxs font-semibold text-zinc-500 uppercase tracking-wider">
                Licensee Discord
              </span>
              <div className="p-2 bg-zinc-950/30 border border-border rounded flex items-center justify-between">
                <span className="font-medium text-zinc-200">{license.ownerTag}</span>
                <span className="text-xs font-mono text-zinc-500">{license.ownerId}</span>
              </div>
            </div>

            {/* License Type */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xxs font-semibold text-zinc-500 uppercase tracking-wider">
                License Category
              </span>
              <div className="p-2 bg-zinc-950/30 border border-border rounded flex items-center">
                <span className="text-xs uppercase font-bold text-zinc-300 tracking-wider">
                  {license.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps Card */}
        <div className="flat-card p-6 bg-card space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            Validity Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/50">
              <span className="text-zinc-500">Created At</span>
              <span className="text-zinc-300 font-mono text-xs">{formattedDate(license.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/50">
              <span className="text-zinc-500">Expires At</span>
              <span className="text-zinc-300 font-mono text-xs">
                {license.expiresAt ? formattedDate(license.expiresAt) : 'Never (LIFETIME)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/50">
              <span className="text-zinc-500">Activated At</span>
              <span className="text-zinc-300 font-mono text-xs">{formattedDate(license.activatedAt)}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1.5 border-b border-border/50">
              <span className="text-zinc-500">Last Validated</span>
              <span className="text-zinc-300 font-mono text-xs">{formattedDate(license.lastValidatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - HWID and IPs */}
      <div className="space-y-6">
        {/* Hardware Lock */}
        <div className="flat-card p-6 bg-card space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-zinc-400" />
            Hardware Lock (HWID)
          </h4>
          <div className="space-y-4">
            <div className="bg-zinc-950 p-2 border border-border rounded font-mono text-xs flex items-center justify-between">
              {license.hwid ? (
                <>
                  <span className="text-zinc-400">••••••••{license.hwid.slice(-12)}</span>
                  <button
                    onClick={() => handleCopy(license.hwid || '')}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150 p-1 hover:bg-zinc-800 rounded"
                    title="Copy hardware signature"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <span className="text-zinc-600 italic">No hardware bound yet</span>
              )}
            </div>

            {license.hwid && (
              <button
                onClick={handleHwidReset}
                disabled={hwidResetMutation.isPending}
                className="w-full flat-btn flat-btn-secondary text-xs uppercase tracking-wider py-2 disabled:opacity-50"
              >
                {hwidResetMutation.isPending ? 'Resetting...' : 'Reset Hardware Lock'}
              </button>
            )}
          </div>
        </div>

        {/* IP Whitelist Manager */}
        <div className="flat-card p-6 bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              Allowed IPv4 Addresses
            </h4>
            <span className="text-xs font-mono text-zinc-500">
              {license.allowedIps.length} / {license.maxIps}
            </span>
          </div>

          <div className="space-y-4">
            {/* IP list */}
            {license.allowedIps.length === 0 ? (
              <p className="text-xs italic text-zinc-600 py-1">No IP addresses whitelisted</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {license.allowedIps.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between bg-zinc-950 p-2 border border-border rounded font-mono text-xs text-zinc-300"
                  >
                    <span>{ip}</span>
                    <button
                      onClick={() => handleRemoveIp(ip)}
                      disabled={updateIpsMutation.isPending}
                      className="text-zinc-500 hover:text-rose-400 p-0.5 hover:bg-zinc-800 rounded transition-colors duration-150"
                      title="Remove IP"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add IP form */}
            {license.allowedIps.length < license.maxIps && (
              <form onSubmit={handleAddIp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.10"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="flat-input flex-grow font-mono text-xs py-1.5"
                  disabled={updateIpsMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={updateIpsMutation.isPending || !newIp.trim()}
                  className="flat-btn flat-btn-primary p-2 w-9 h-9 flex items-center justify-center disabled:opacity-50"
                  title="Add IP"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
