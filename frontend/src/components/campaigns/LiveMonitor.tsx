'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Users, Send, CheckCircle, XCircle, Eye, MousePointer } from 'lucide-react';

interface LiveStats {
  id: string;
  name: string;
  status: string;
  totalRecipients: number;
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
}

interface LiveMonitorProps {
  campaignId: string;
  onClose: () => void;
}

function StatRow({ icon, label, value, color, total }: { icon: React.ReactNode; label: string; value: number; color: string; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: '#6b7280' }}>
          {icon}
          <span className="text-sm">{label}</span>
        </div>
        <span className="font-mono text-sm font-semibold" style={{ color: '#f0f0f0' }}>{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

export function LiveMonitor({ campaignId, onClose }: LiveMonitorProps) {
  const [stats, setStats] = useState<LiveStats | null>(null);

  useEffect(() => {
    const poll = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns/${campaignId}/stats`);
      const d = await res.json();
      setStats(d);
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [campaignId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        className="w-full max-w-md rounded-2xl border p-6"
        style={{ background: '#161616', borderColor: '#1f1f1f', boxShadow: '0 30px 80px rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h2 className="font-semibold" style={{ color: '#f0f0f0' }}>
              {stats?.name || 'Live Monitor'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: '#6b7280' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {!stats ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="shimmer rounded h-10" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <StatRow icon={<Users className="w-4 h-4" />} label="Total Recipients" value={stats.totalRecipients} color="#4f6ef7" total={stats.totalRecipients} />
            <StatRow icon={<Send className="w-4 h-4" />} label="Sent" value={stats.sent} color="#06b6d4" total={stats.totalRecipients} />
            <StatRow icon={<CheckCircle className="w-4 h-4" />} label="Delivered" value={stats.delivered} color="#22c55e" total={stats.totalRecipients} />
            <StatRow icon={<XCircle className="w-4 h-4" />} label="Failed" value={stats.failed} color="#ef4444" total={stats.totalRecipients} />
            <StatRow icon={<Eye className="w-4 h-4" />} label="Opened" value={stats.opened} color="#7c5cbf" total={stats.delivered || 1} />
            <StatRow icon={<MousePointer className="w-4 h-4" />} label="Clicked" value={stats.clicked} color="#f59e0b" total={stats.opened || 1} />

            <div className="pt-4 border-t" style={{ borderColor: '#1f1f1f' }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: '#6b7280' }}>Status</span>
                <span className="font-medium capitalize" style={{ color: stats.status === 'running' ? '#22c55e' : '#f0f0f0' }}>
                  {stats.status}
                </span>
              </div>
              <p className="text-xs mt-2" style={{ color: '#3f3f46' }}>Refreshing every 2 seconds…</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
