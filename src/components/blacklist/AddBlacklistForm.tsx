'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import { useAddBlacklistMutation } from '@/hooks/useBlacklist';
import { toast } from 'sonner';

const blacklistSchema = z.object({
  type: z.enum(['key', 'hwid', 'ip']),
  value: z.string().min(1, 'Blocked value is required'),
  reason: z.string().min(4, 'Reason must be at least 4 characters').max(250, 'Reason is too long'),
});

type FormValues = z.infer<typeof blacklistSchema>;

export default function AddBlacklistForm() {
  const { mutate, isPending } = useAddBlacklistMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(blacklistSchema),
    defaultValues: {
      type: 'ip',
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(
      {
        type: values.type,
        value: values.value,
        reason: values.reason,
      },
      {
        onSuccess: () => {
          toast.success('Successfully added to global blacklist');
          reset({
            type: 'ip',
            value: '',
            reason: '',
          });
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to blacklist target');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flat-card p-6 bg-card space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2">
        Blacklist New Entity
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Block Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="blacklistType" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
            Block Type
          </label>
          <select id="blacklistType" {...register('type')} className="flat-input bg-zinc-950 text-xs">
            <option value="ip">IP Address</option>
            <option value="key">License Key</option>
            <option value="hwid">Hardware ID (HWID)</option>
          </select>
          {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
        </div>

        {/* Target Value */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="blacklistValue" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
            Target Value (IP, Key, or HWID)
          </label>
          <input
            id="blacklistValue"
            type="text"
            placeholder="e.g. 192.168.1.1 or uuid.sig"
            className="flat-input text-xs font-mono"
            {...register('value')}
          />
          {errors.value && <p className="text-xs text-rose-500">{errors.value.message}</p>}
        </div>
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="blacklistReason" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
          Enforcement Reason
        </label>
        <input
          id="blacklistReason"
          type="text"
          placeholder="Specify the reason for blacklisting this entity..."
          className="flat-input text-xs"
          {...register('reason')}
        />
        {errors.reason && <p className="text-xs text-rose-500">{errors.reason.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flat-btn flat-btn-danger flex items-center justify-center gap-2 text-xs uppercase tracking-wider py-2 disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        {isPending ? 'Enforcing...' : 'Enforce Blacklist'}
      </button>
    </form>
  );
}
