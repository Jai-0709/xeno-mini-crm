'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useState } from 'react';

const dailyData = [
  { day: 'Mon', delivered: 1200, opened: 480 },
  { day: 'Tue', delivered: 1850, opened: 720 },
  { day: 'Wed', delivered: 1400, opened: 560 },
  { day: 'Thu', delivered: 2200, opened: 920 },
  { day: 'Fri', delivered: 1900, opened: 780 },
  { day: 'Sat', delivered: 1100, opened: 430 },
  { day: 'Sun', delivered: 950,  opened: 370 },
];

const weeklyData = [
  { day: 'Wk 1', delivered: 8200,  opened: 3100 },
  { day: 'Wk 2', delivered: 11400, opened: 4500 },
  { day: 'Wk 3', delivered: 9800,  opened: 3800 },
  { day: 'Wk 4', delivered: 13200, opened: 5200 },
];

const monthlyData = [
  { day: 'Jan', delivered: 32000, opened: 12400 },
  { day: 'Feb', delivered: 28000, opened: 11200 },
  { day: 'Mar', delivered: 41000, opened: 16200 },
  { day: 'Apr', delivered: 38000, opened: 15000 },
  { day: 'May', delivered: 45000, opened: 18400 },
  { day: 'Jun', delivered: 39000, opened: 15600 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-card border border-border rounded-card px-4 py-3 shadow-xl">
      <p className="text-xs text-text-secondary mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-text-secondary capitalize">{p.name}:</span>
          <span className="font-mono font-semibold text-text-primary">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const periods = ['Daily', 'Weekly', 'Monthly'] as const;

export function EngagementChart() {
  const [period, setPeriod] = useState<typeof periods[number]>('Daily');
  const data = period === 'Daily' ? dailyData : period === 'Weekly' ? weeklyData : monthlyData;

  return (
    <div className="bg-bg-card border border-border rounded-card p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Engagement Trend</h3>
          <p className="text-xs text-text-secondary mt-0.5">Delivered vs Opened over time</p>
        </div>
        <div className="flex gap-1 bg-bg/50 rounded-lg p-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${
                period === p ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOpened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c5cbf" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7c5cbf" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }} />
          <Legend
            formatter={(v) => <span className="text-xs text-text-secondary capitalize">{v}</span>}
            iconType="circle"
            iconSize={8}
          />
          <Area type="monotone" dataKey="delivered" stroke="#4f6ef7" strokeWidth={2} fill="url(#colorDelivered)" dot={false} activeDot={{ r: 4, fill: '#4f6ef7' }} animationDuration={1200} />
          <Area type="monotone" dataKey="opened" stroke="#7c5cbf" strokeWidth={2} fill="url(#colorOpened)" dot={false} activeDot={{ r: 4, fill: '#7c5cbf' }} animationDuration={1200} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
