'use client';

import { useEffect, useState } from 'react';
import { Users, Send, Eye, TrendingUp, Zap } from 'lucide-react';

interface Stats {
  customers: number;
  campaigns: number;
  avgOpenRate: number;
}

const QUICK_ACTIONS = [
  'Show me top performing campaigns',
  'Which segment has the highest spend?',
  'Suggest a re-engagement strategy',
  'What time should I send campaigns?',
];

interface ContextPanelProps {
  onQuickAction: (prompt: string) => void;
}

export function ContextPanel({ onQuickAction }: ContextPanelProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Fetch live stats
    Promise.all([
      fetch('http://localhost:5000/api/customers').then(r => r.json()),
      fetch('http://localhost:5000/api/campaigns').then(r => r.json()),
    ]).then(([customers, campaigns]) => {
      const openRates = campaigns.filter((c: any) => c.delivered > 0)
        .map((c: any) => c.opened / c.delivered * 100);
      const avgOpenRate = openRates.length
        ? Math.round(openRates.reduce((a: number, b: number) => a + b, 0) / openRates.length)
        : 0;
      setStats({ customers: customers.length, campaigns: campaigns.length, avgOpenRate });
    });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Live stats */}
      <div className="rounded-xl border p-4" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>LIVE STATS</span>
        </div>
        {stats ? (
          <div className="flex flex-col gap-3">
            {[
              { icon: <Users className="w-3.5 h-3.5" />, label: 'Customers', value: stats.customers, color: '#4f6ef7' },
              { icon: <Send className="w-3.5 h-3.5" />, label: 'Campaigns', value: stats.campaigns, color: '#7c5cbf' },
              { icon: <Eye className="w-3.5 h-3.5" />, label: 'Avg Open Rate', value: `${stats.avgOpenRate}%`, color: '#22c55e' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2" style={{ color: '#6b7280' }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </div>
                <span className="font-mono text-sm font-semibold" style={{ color: '#f0f0f0' }}>{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="shimmer rounded h-5" />)}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
          <span className="text-xs font-semibold" style={{ color: '#6b7280' }}>QUICK ACTIONS</span>
        </div>
        <div className="flex flex-col gap-2">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              className="text-left px-3 py-2.5 rounded-lg border text-xs transition-all"
              style={{ borderColor: '#1f1f1f', color: '#6b7280', background: '#111111' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#4f6ef7';
                (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f0';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1f1f1f';
                (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="p-3 rounded-lg" style={{ background: 'rgba(124,92,191,0.06)', border: '1px solid rgba(124,92,191,0.15)' }}>
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp className="w-3 h-3" style={{ color: '#7c5cbf' }} />
          <span className="text-xs font-medium" style={{ color: '#7c5cbf' }}>Pro Tip</span>
        </div>
        <p className="text-xs" style={{ color: '#6b7280' }}>
          Ask the AI to analyze your segment performance or suggest optimal send times for better engagement.
        </p>
      </div>
    </div>
  );
}
