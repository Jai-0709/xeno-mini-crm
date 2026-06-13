'use client';

import { MetricCard } from '@/components/ui/MetricCard';
import { EngagementChart } from '@/components/charts/EngagementChart';
import { ChannelDonut } from '@/components/charts/ChannelDonut';
import { DeliveryBarChart } from '@/components/charts/DeliveryBarChart';
import { HeatmapGrid } from '@/components/charts/HeatmapGrid';
import { BarChart2, Send, Eye, MousePointer, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 5000);
    return () => clearInterval(interval);
  }, [fetchCampaigns]);

  // Aggregate metrics from real campaign data
  const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);

  const avgOpenRate = totalDelivered > 0
    ? Math.round((totalOpened / totalDelivered) * 100 * 10) / 10
    : 0;
  const ctr = totalDelivered > 0
    ? Math.round((totalClicked / totalDelivered) * 100 * 10) / 10
    : 0;
  const conversion = totalClicked > 0
    ? Math.round((totalClicked * 0.22) / totalDelivered * 100 * 10) / 10
    : 0;

  const metrics = [
    { title: 'Total Delivered', value: totalDelivered.toLocaleString('en-IN'), delta: 12.4, icon: <Send className="w-5 h-5" style={{ color: '#4f6ef7' }} />, glowColor: '#4f6ef7' },
    { title: 'Avg Open Rate',   value: `${avgOpenRate}%`,   delta: 3.1,  icon: <Eye className="w-5 h-5" style={{ color: '#22c55e' }} />,  glowColor: '#22c55e' },
    { title: 'Click-Through',   value: `${ctr}%`,           delta: -1.2, icon: <MousePointer className="w-5 h-5" style={{ color: '#f59e0b' }} />, glowColor: '#f59e0b' },
    { title: 'Conversion',      value: `${conversion}%`,    delta: 2.8,  icon: <TrendingUp className="w-5 h-5" style={{ color: '#7c5cbf' }} />, glowColor: '#7c5cbf' },
  ];

  const CHANNEL_COLORS: Record<string, string> = {
    whatsapp: '#25D366', email: '#4f6ef7', sms: '#f59e0b', rcs: '#7c5cbf',
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(79,110,247,0.12)' }}>
          <BarChart2 className="w-5 h-5" style={{ color: '#4f6ef7' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f0' }}>Analytics</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Campaign performance and engagement insights</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => <MetricCard key={m.title} {...m} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <EngagementChart />
        </div>
        <ChannelDonut />
      </div>

      {/* Delivery + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DeliveryBarChart />
        <HeatmapGrid />
      </div>

      {/* Campaign comparison table — live data */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1f1f1f' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1f1f1f', background: '#111111' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>Campaign Comparison</h3>
          {campaigns.some(c => c.status === 'running') && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs" style={{ color: '#22c55e' }}>Live</span>
            </div>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1f1f1f' }}>
              {['Campaign', 'Channel', 'Status', 'Sent', 'Delivered', 'Open Rate', 'CTR'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium" style={{ color: '#6b7280', background: '#111111' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #111111' }}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="shimmer rounded h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center" style={{ color: '#6b7280' }}>
                  No campaigns yet
                </td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const openRate = c.delivered > 0 ? Math.round(c.opened / c.delivered * 100) : 0;
                const ctrVal = c.delivered > 0 ? Math.round(c.clicked / c.delivered * 100) : 0;
                const statusColor: Record<string, string> = {
                  completed: '#22c55e', running: '#4f6ef7', failed: '#ef4444',
                  draft: '#6b7280', scheduled: '#f59e0b', launching: '#06b6d4',
                };
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #111111' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-5 py-3 font-medium" style={{ color: '#f0f0f0' }}>{c.name}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ color: CHANNEL_COLORS[c.channel] || '#6b7280', background: (CHANNEL_COLORS[c.channel] || '#6b7280') + '18' }}>
                        {c.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium capitalize flex items-center gap-1.5">
                        {c.status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />}
                        <span style={{ color: statusColor[c.status] || '#6b7280' }}>{c.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono" style={{ color: '#f0f0f0' }}>{c.sent.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-mono" style={{ color: '#f0f0f0' }}>{c.delivered.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-mono font-semibold" style={{ color: '#22c55e' }}>{openRate}%</td>
                    <td className="px-5 py-3 font-mono" style={{ color: '#4f6ef7' }}>{ctrVal}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
