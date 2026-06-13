'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const data = [
  { channel: 'WhatsApp', delivered: 94, color: '#25D366' },
  { channel: 'Email',    delivered: 87, color: '#4f6ef7' },
  { channel: 'SMS',      delivered: 91, color: '#f59e0b' },
  { channel: 'RCS',      delivered: 78, color: '#7c5cbf' },
];

export function DeliveryBarChart() {
  return (
    <div className="rounded-xl border p-5" style={{ background: '#161616', borderColor: '#1f1f1f' }}>
      <h3 className="text-sm font-semibold mb-4" style={{ color: '#f0f0f0' }}>Delivery Rate by Channel (%)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="channel" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
          <Tooltip
            contentStyle={{ background: '#1a1a1a', border: '1px solid #1f1f1f', borderRadius: 8, color: '#f0f0f0', fontSize: 12 }}
            formatter={(v) => [`${v}%`, 'Delivery Rate']}
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
          />
          <Bar dataKey="delivered" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
