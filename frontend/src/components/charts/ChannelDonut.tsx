'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const data = [
  { name: 'WhatsApp', value: 42, color: '#25D366' },
  { name: 'Email',    value: 31, color: '#4f6ef7' },
  { name: 'SMS',      value: 18, color: '#f59e0b' },
  { name: 'RCS',      value: 9,  color: '#7c5cbf' },
];

const RADIAN = Math.PI / 180;
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ChannelDonut() {
  return (
    <div className="rounded-xl border p-5" style={{ background: '#161616', borderColor: '#1f1f1f' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f0' }}>Channel Distribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
            dataKey="value" labelLine={false} label={renderCustomLabel}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #1f1f1f', borderRadius: 8, color: '#f0f0f0', fontSize: 12 }}
            formatter={(v) => [`${v}%`, 'Share']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: '#6b7280' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
