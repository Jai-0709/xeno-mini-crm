'use client';

import { motion } from 'framer-motion';
import { ChannelPill } from '@/components/ui/ChannelPill';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Users, BarChart2, Send, Eye, Trash2 } from 'lucide-react';

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

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
  onLaunch: (id: string) => void;
  onMonitor: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignCard({ campaign: c, index, onLaunch, onMonitor, onDelete }: CampaignCardProps) {
  const deliveryRate = c.totalRecipients > 0 ? Math.round((c.delivered / c.totalRecipients) * 100) : 0;
  const openRate = c.delivered > 0 ? Math.round((c.opened / c.delivered) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border p-5 flex flex-col gap-4 transition-all"
      style={{ background: '#161616', borderColor: '#1f1f1f' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f1f'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: '#f0f0f0' }}>{c.name}</h3>
          {c.segment && (
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
              <Users className="w-3 h-3 inline mr-1" />
              {c.segment.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ChannelPill channel={c.channel} />
          <StatusBadge status={c.status} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Recipients', value: c.totalRecipients, icon: <Users className="w-3 h-3" /> },
          { label: 'Delivery', value: `${deliveryRate}%`, icon: <Send className="w-3 h-3" /> },
          { label: 'Open Rate', value: `${openRate}%`, icon: <Eye className="w-3 h-3" /> },
        ].map(m => (
          <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: '#111111' }}>
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: '#6b7280' }}>
              {m.icon}
              <span className="text-xs">{m.label}</span>
            </div>
            <div className="font-mono text-sm font-semibold" style={{ color: '#f0f0f0' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar (delivery) */}
      {c.totalRecipients > 0 && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: '#6b7280' }}>Delivery progress</span>
            <span className="text-xs font-mono" style={{ color: '#f0f0f0' }}>{c.delivered}/{c.totalRecipients}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #4f6ef7, #7c5cbf)' }}
              initial={{ width: 0 }}
              animate={{ width: `${deliveryRate}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {c.status === 'draft' && (
          <button
            onClick={() => onLaunch(c.id)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            style={{ background: 'linear-gradient(135deg, #4f6ef7, #7c5cbf)', color: '#fff' }}
          >
            <Send className="w-3.5 h-3.5" /> Launch
          </button>
        )}
        {(c.status === 'running' || c.status === 'completed') && (
          <button
            onClick={() => onMonitor(c.id)}
            className="flex-1 py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            style={{ borderColor: '#2a2a2a', color: '#6b7280' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f0f0f0'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#4f6ef7'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'; }}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Live Stats
          </button>
        )}
        <button
          onClick={() => onDelete(c.id)}
          className="p-2 rounded-lg transition-colors flex-shrink-0 text-red-500/80 hover:text-red-500 ml-auto"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
