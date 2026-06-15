'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { usePluginsQuery, useCreatePluginMutation } from '@/hooks/useLicenses';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Plus, FolderPlus, ArrowRight } from 'lucide-react';

const pluginSchema = z.object({
  name: z.string().min(2, 'Plugin name must be at least 2 characters').max(64, 'Max 64 characters'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(32, 'Max 32 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and hyphens only'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().max(256, 'Max 256 characters').optional(),
});

type FormValues = z.infer<typeof pluginSchema>;

export default function PluginsPage() {
  const router = useRouter();
  const { data: plugins = [], isLoading } = usePluginsQuery();
  const createMutation = useCreatePluginMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(pluginSchema),
    defaultValues: {
      name: '',
      slug: '',
      version: '1.0.0',
      description: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('Plugin registered successfully');
        reset({
          name: '',
          slug: '',
          version: '1.0.0',
          description: '',
        });
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to register plugin');
      },
    });
  };

  const handleRowClick = (slug: string) => {
    router.push(`/licenses?pluginId=${slug}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Plugin List Column (Left) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flat-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-zinc-900/50">
                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Plugin Name</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Licenses</th>
                <th className="px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="h-14">
                    <td colSpan={4} className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : plugins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                    No plugins registered yet.
                  </td>
                </tr>
              ) : (
                plugins.map((plugin) => (
                  <tr
                    key={plugin._id}
                    onClick={() => handleRowClick(plugin._id)}
                    className="h-14 hover:bg-zinc-800/10 cursor-pointer outline-none transition-colors duration-150 group"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-zinc-200">
                      <div className="flex items-center gap-2">
                        {plugin.name}
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-400">{plugin.slug}</td>
                    <td className="px-4 py-3 text-sm font-bold text-primary">{plugin.licenseCount}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {format(new Date(plugin.createdAt), 'yyyy-MM-dd')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Plugin Column (Right) */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="flat-card p-6 bg-card space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-zinc-500" />
            Register Plugin
          </h3>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pluginName" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
              Plugin Name
            </label>
            <input
              id="pluginName"
              type="text"
              placeholder="e.g. AstroX AntiCheat"
              className="flat-input text-xs"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pluginSlug" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
              Plugin Slug
            </label>
            <input
              id="pluginSlug"
              type="text"
              placeholder="e.g. astrox-anticheat"
              className="flat-input text-xs font-mono"
              {...register('slug')}
            />
            {errors.slug && <p className="text-xs text-rose-500">{errors.slug.message}</p>}
          </div>

          {/* Version */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pluginVersion" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
              Default Version
            </label>
            <input
              id="pluginVersion"
              type="text"
              placeholder="e.g. 1.0.0"
              className="flat-input text-xs font-mono"
              {...register('version')}
            />
            {errors.version && <p className="text-xs text-rose-500">{errors.version.message}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pluginDescription" className="text-xxs font-semibold text-zinc-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              id="pluginDescription"
              placeholder="Brief overview of the plugin functionalities..."
              className="flat-input text-xs min-h-[80px]"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-rose-500">{errors.description.message}</p>}
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full flat-btn flat-btn-primary flex items-center justify-center gap-2 text-xs uppercase tracking-wider py-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? 'Registering...' : 'Register Plugin'}
          </button>
        </form>
      </div>
    </div>
  );
}
