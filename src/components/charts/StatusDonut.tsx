'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StatusDonutProps {
  data: {
    active: number;
    suspended: number;
    revoked: number;
    expired: number;
  };
}

export default function StatusDonut({ data }: StatusDonutProps) {
  const chartData = [
    { name: 'Active', value: data.active, color: '#10b981' },
    { name: 'Suspended', value: data.suspended, color: '#f59e0b' },
    { name: 'Revoked', value: data.revoked, color: '#f43f5e' },
    { name: 'Expired', value: data.expired, color: '#71717a' },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="h-60 flex items-center justify-center text-xs text-zinc-500 uppercase tracking-wider">
        No status data available
      </div>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#18181b" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              borderColor: '#27272a',
              borderRadius: '4px',
              color: '#f4f4f5',
            }}
            itemStyle={{ color: '#f4f4f5' }}
            cursor={false}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
