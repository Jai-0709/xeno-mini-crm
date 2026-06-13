'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ChannelPill } from '@/components/ui/ChannelPill';
import { ArrowUpDown } from 'lucide-react';

const recentActivity = [
  { id: 1, campaign: 'Diwali Flash Sale', segment: 'VIP Customers', channel: 'whatsapp', sent: 1240, delivered: 1198, opened: 814, clicked: 203, status: 'completed' },
  { id: 2, campaign: 'Win-Back Campaign', segment: 'Win-Back',      channel: 'email',    sent: 892,  delivered: 856,  opened: 462, clicked: 98,  status: 'completed' },
  { id: 3, campaign: 'Summer Monsoon',    segment: 'Repeat Buyers', channel: 'sms',      sent: 540,  delivered: 510,  opened: 240, clicked: 62,  status: 'running'   },
  { id: 4, campaign: 'New Collection',    segment: 'New Joiners',   channel: 'rcs',      sent: 320,  delivered: 0,    opened: 0,   clicked: 0,   status: 'scheduled' },
  { id: 5, campaign: 'AOV Booster',       segment: 'High AOV',      channel: 'whatsapp', sent: 670,  delivered: 641,  opened: 342, clicked: 88,  status: 'completed' },
];

type SortKey = 'sent' | 'opened' | 'clicked' | 'delivered';

export function ActivityTable() {
  const [sortKey, setSortKey] = useState<SortKey>('sent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sorted = [...recentActivity].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortDir === 'desc' ? -diff : diff;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortBtn = ({ k }: { k: SortKey }) => (
    <button onClick={() => handleSort(k)} className="inline-flex items-center gap-1 hover:text-text-primary transition-colors">
      {k.charAt(0).toUpperCase() + k.slice(1)}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

  return (
    <div className="bg-bg-card border border-border rounded-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary">Recent Activity</h3>
        <span className="text-xs text-text-secondary">{recentActivity.length} campaigns</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {['Campaign', 'Segment', 'Channel', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Status'].map(col => (
                <th key={col} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
                  {['Sent','Delivered','Opened','Clicked'].includes(col)
                    ? <SortBtn k={col.toLowerCase() as SortKey} />
                    : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id} className={`table-row-hover border-b border-border/50 transition-all ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">{row.campaign}</td>
                <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{row.segment}</td>
                <td className="px-4 py-3"><ChannelPill channel={row.channel} /></td>
                <td className="px-4 py-3 font-mono text-sm text-text-primary">{row.sent.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-text-primary">{row.delivered.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-text-primary">{row.opened.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-sm text-text-primary">{row.clicked.toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
