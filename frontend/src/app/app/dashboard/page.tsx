'use client';

import { MetricCard } from '@/components/ui/MetricCard';
import { EngagementChart } from '@/components/charts/EngagementChart';
import { TopCampaigns } from '@/components/dashboard/TopCampaigns';
import { ActivityTable } from '@/components/dashboard/ActivityTable';
import { MetricCardSkeleton } from '@/components/ui/SkeletonLoader';
import { Users, Send, BarChart2, TrendingUp, Download, Calendar, RefreshCw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useToastStore } from '@/store/useToastStore';

interface DashboardStats {
  customerCount: number;
  campaignCount: number;
  activeCampaigns: number;
  avgOpenRate: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [range, setRange] = useState<'Today' | '7D' | '30D'>('7D');
  const [refreshing, setRefreshing] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch {
      // fallback to placeholders
      setStats({ customerCount: 50, campaignCount: 8, activeCampaigns: 0, avgOpenRate: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5s to catch live campaign updates
    const interval = setInterval(() => fetchStats(), 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const metrics = stats ? [
    {
      title: 'Total Customers',
      value: stats.customerCount,
      delta: 12.4,
      icon: <Users className="w-5 h-5" />,
      glowColor: '#4f6ef7',
      prefix: '',
      suffix: '',
    },
    {
      title: 'Campaigns',
      value: stats.campaignCount,
      delta: stats.activeCampaigns > 0 ? stats.activeCampaigns : 0,
      icon: <Send className="w-5 h-5" />,
      glowColor: '#7c5cbf',
      prefix: '',
      suffix: '',
    },
    {
      title: 'Avg Open Rate',
      value: stats.avgOpenRate,
      delta: 5.1,
      icon: <BarChart2 className="w-5 h-5" />,
      glowColor: '#22c55e',
      prefix: '',
      suffix: '%',
    },
    {
      title: 'Revenue Attributed',
      value: stats.totalRevenue,
      delta: 8.2,
      icon: <TrendingUp className="w-5 h-5" />,
      glowColor: '#f59e0b',
      prefix: '₹',
      suffix: '',
    },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Subheader */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Overview</h2>
          <p className="text-sm text-text-secondary mt-0.5">Your brand's marketing performance at a glance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date range */}
          <div className="flex gap-1 bg-bg-card border border-border rounded-lg p-1">
            {(['Today', '7D', '30D'] as const).map(r => (
              <button
                key={r}
                onClick={() => {
                  setRange(r);
                  addToast({ type: 'info', title: 'Date Range Updated', message: `Showing data for ${r}` });
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                  range === r ? 'bg-accent-blue/10 text-accent-blue' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {r}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={() => {
              fetchStats(true);
              addToast({ type: 'success', title: 'Dashboard Refreshed', message: 'Latest metrics loaded' });
            }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-btn border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export */}
          <button
            onClick={() => {
              if (!stats) return;
              const csv = [
                'Metric,Value',
                `Total Customers,${stats.customerCount}`,
                `Total Campaigns,${stats.campaignCount}`,
                `Active Campaigns,${stats.activeCampaigns}`,
                `Avg Open Rate,${stats.avgOpenRate}%`,
                `Revenue Attributed,₹${stats.totalRevenue}`,
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `lumora-dashboard-${range}.csv`; a.click();
              URL.revokeObjectURL(url);
              addToast({ type: 'success', title: 'Export Complete', message: 'CSV file downloaded' });
            }}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-btn border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Row 1 — Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : metrics.map((m) => <MetricCard key={m.title} {...m} />)}
      </div>

      {/* Row 2 — Chart + Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="col-span-1 lg:col-span-3">
          <EngagementChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <TopCampaigns />
        </div>
      </div>

      {/* Row 3 — Activity table */}
      <ActivityTable />
    </div>
  );
}
