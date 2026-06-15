'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { useCreateLicenseMutation } from '@/hooks/useLicenses';
import { toast } from 'sonner';

interface PluginOption {
  _id: string;
  name: string;
}

interface GenerateLicenseFormProps {
  plugins: PluginOption[];
  onClose: () => void;
}

const generateLicenseSchema = z
  .object({
    pluginId: z.string().min(1, 'Plugin selection is required'),
    ownerId: z.string().regex(/^\d{17,20}$/, 'Must be a valid Discord ID (17-20 digits)'),
    ownerTag: z
      .string()
      .min(2, 'Discord username must be at least 2 characters')
      .max(32, 'Discord username must be at most 32 characters')
      .regex(/^[a-z0-9_.]+$/, 'Must be a valid Discord username (lowercase, alphanumeric, underscores, or periods)'),
    type: z.enum(['lifetime', 'trial', 'subscription']),
    durationDays: z.string().optional(),
    maxIps: z.string().regex(/^\d+$/, 'Must be a valid number of IPs'),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'lifetime') {
      if (!data.durationDays || parseInt(data.durationDays, 10) <= 0 || isNaN(parseInt(data.durationDays, 10))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['durationDays'],
          message: 'Duration is required for non-lifetime licenses',
        });
      }
    }
  });

type FormValues = z.infer<typeof generateLicenseSchema>;

export default function GenerateLicenseForm({ plugins, onClose }: GenerateLicenseFormProps) {
  const { mutate, isPending } = useCreateLicenseMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(generateLicenseSchema),
    defaultValues: {
      type: 'lifetime',
      maxIps: '1',
    },
  });

  const selectedType = watch('type');

  const onSubmit = (values: FormValues) => {
    const days = values.durationDays ? parseInt(values.durationDays, 10) : 0;
    const duration =
      values.type !== 'lifetime' && !isNaN(days) && days > 0
        ? days * 24 * 60 * 60 * 1000 // Convert days to ms
        : undefined;

    mutate(
      {
        pluginId: values.pluginId,
        ownerId: values.ownerId,
        ownerTag: values.ownerTag,
        type: values.type,
        maxIps: parseInt(values.maxIps, 10) || 1,
        duration,
      },
      {
        onSuccess: () => {
          toast.success('License generated successfully');
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to generate license');
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full bg-card text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-lg font-bold text-white tracking-tight">Generate License</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Plugin Select */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pluginId" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Target Plugin
          </label>
          <select id="pluginId" {...register('pluginId')} className="flat-input bg-zinc-950">
            <option value="">Select a plugin...</option>
            {plugins.map((plugin) => (
              <option key={plugin._id} value={plugin._id}>
                {plugin.name}
              </option>
            ))}
          </select>
          {errors.pluginId && <p className="text-xs text-rose-500">{errors.pluginId.message}</p>}
        </div>

        {/* Owner Discord ID */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerId" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Owner Discord ID
          </label>
          <input
            id="ownerId"
            type="text"
            placeholder="e.g. 123456789012345678"
            className="flat-input"
            {...register('ownerId')}
          />
          {errors.ownerId && <p className="text-xs text-rose-500">{errors.ownerId.message}</p>}
        </div>

        {/* Owner Discord Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ownerTag" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Owner Discord Username
          </label>
          <input
            id="ownerTag"
            type="text"
            placeholder="e.g. lowercase_username"
            className="flat-input"
            {...register('ownerTag')}
          />
          {errors.ownerTag && <p className="text-xs text-rose-500">{errors.ownerTag.message}</p>}
        </div>

        {/* License Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            License Type
          </label>
          <select id="type" {...register('type')} className="flat-input bg-zinc-950">
            <option value="lifetime">LIFETIME</option>
            <option value="trial">TRIAL</option>
            <option value="subscription">SUBSCRIPTION</option>
          </select>
          {errors.type && <p className="text-xs text-rose-500">{errors.type.message}</p>}
        </div>

        {/* Duration (if not lifetime) */}
        {selectedType !== 'lifetime' && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="durationDays" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Duration (Days)
            </label>
            <input
              id="durationDays"
              type="number"
              min="1"
              placeholder="e.g. 30"
              className="flat-input"
              {...register('durationDays')}
            />
            {errors.durationDays && <p className="text-xs text-rose-500">{errors.durationDays.message}</p>}
          </div>
        )}

        {/* Max IPs */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="maxIps" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Maximum Whitelisted IPs
          </label>
          <input
            id="maxIps"
            type="number"
            min="1"
            className="flat-input"
            {...register('maxIps')}
          />
          {errors.maxIps && <p className="text-xs text-rose-500">{errors.maxIps.message}</p>}
        </div>

        {/* Submit */}
        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flat-btn flat-btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Generating...' : 'Generate License'}
          </button>
          <button type="button" onClick={onClose} className="flat-btn flat-btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
