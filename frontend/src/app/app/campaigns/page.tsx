'use client';

import { useState, useEffect, useCallback } from 'react';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { NewCampaignFlow } from '@/components/campaigns/NewCampaignFlow';
import { LiveMonitor } from '@/components/campaigns/LiveMonitor';
import { Send, Plus } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: string;
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  sent: number;
  failed: number;
  createdAt: string;
  segment?: { name: string };
}

const TABS = ['All','Active','Scheduled','Completed','Failed','Draft'] as const;
type Tab = typeof TABS[number];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [monitorId, setMonitorId] = useState<string | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/campaigns');
    const data = await res.json();
    setCampaigns(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  async function handleLaunch(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/campaigns/${id}/launch`, { method: 'POST' });
    if (res.ok) {
      addToast({ type: 'success', title: 'Campaign launched!', message: 'Messages are being sent to your audience' });
      setMonitorId(id);
      fetchCampaigns();
    } else {
      addToast({ type: 'error', title: 'Launch failed', message: 'Please try again' });
    }
  }

  const filtered = campaigns.filter(c => {
    if (tab === 'All') return true;
    if (tab === 'Active') return c.status === 'running';
    return c.status === tab.toLowerCase();
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(79,110,247,0.12)' }}>
            <Send className="w-5 h-5" style={{ color: '#4f6ef7' }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold" style={{ color: '#f0f0f0' }}>Campaigns</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>Manage and launch marketing campaigns</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #4f6ef7, #7c5cbf)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: '#111111' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
            style={{ background: tab === t ? '#1f1f1f' : 'transparent', color: tab === t ? '#f0f0f0' : '#6b7280' }}>
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 font-mono text-xs" style={{ color: '#3f3f46' }}>
                ({campaigns.filter(c => {
                  if (t === 'Active') return c.status === 'running';
                  return c.status === t.toLowerCase();
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border shimmer" style={{ borderColor: '#1f1f1f' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Send className="w-12 h-12" style={{ color: '#3f3f46' }} />
          <p className="text-sm font-medium" style={{ color: '#6b7280' }}>No campaigns found</p>
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg,#4f6ef7,#7c5cbf)', color: '#fff' }}>
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i}
              onLaunch={handleLaunch} onMonitor={setMonitorId} />
          ))}
        </div>
      )}

      {/* Modals */}
      <NewCampaignFlow open={showCreate} onClose={() => setShowCreate(false)} onCreated={fetchCampaigns} />
      {monitorId && <LiveMonitor campaignId={monitorId} onClose={() => setMonitorId(null)} />}
    </div>
  );
}
