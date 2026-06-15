'use client';

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface TypeBarProps {
  types: Record<string, number>;
}

export default function TypeBar({ types = {} }: TypeBarProps) {
  const lifetime = types.lifetime || 0;
  const trial = types.trial || 0;
  const subscription = types.subscription || 0;
  const timed = trial + subscription;

  const chartData = [
    { name: 'LIFETIME', count: lifetime, fill: '#6366f1' },
    { name: 'TIMED', count: timed, fill: '#8b5cf6' },
  ];

  const hasData = lifetime > 0 || timed > 0;

  if (!hasData) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-zinc-500 uppercase tracking-wider">
        No license type data available
      </div>
    );
  }

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
          <Bar dataKey="count" radius={[2, 2, 0, 0]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
