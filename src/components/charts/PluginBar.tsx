'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface PluginBarProps {
  data: Array<{
    _id: string;
    name: string;
    slug: string;
    count: number;
  }>;
}

export default function PluginBar({ data }: PluginBarProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-zinc-500 uppercase tracking-wider">
        No plugin data available
      </div>
    );
  }

  // Format data for chart display
  const chartData = data.map((item) => ({
    name: item.name,
    count: item.count,
  }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '4px',
              color: '#f4f4f5',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
