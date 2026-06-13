'use client';

import { ChannelPill } from '@/components/ui/ChannelPill';

const topCampaigns = [
  { name: 'Diwali Flash Sale',     channel: 'whatsapp', rate: 68, color: '#25D366' },
  { name: 'Win-Back VIPs',         channel: 'email',    rate: 54, color: '#7c5cbf' },
  { name: 'Summer Collection Drop', channel: 'sms',     rate: 47, color: '#4f6ef7' },
  { name: 'Loyalty Rewards Push',  channel: 'rcs',      rate: 41, color: '#f59e0b' },
  { name: 'New Arrivals Tease',    channel: 'whatsapp', rate: 38, color: '#25D366' },
];

export function TopCampaigns() {
  return (
    <div className="bg-bg-card border border-border rounded-card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Top Campaigns</h3>
        <span className="text-xs text-text-secondary">by open rate</span>
      </div>

      <div className="space-y-3">
        {topCampaigns.map((campaign, i) => (
          <div
            key={i}
            className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all duration-150 cursor-pointer"
          >
            {/* Rank */}
            <span className="font-mono text-xs text-text-muted w-4 flex-shrink-0">#{i + 1}</span>

            {/* Name + channel */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate font-medium">{campaign.name}</p>
              <div className="mt-1">
                <ChannelPill channel={campaign.channel} size="xs" />
              </div>
            </div>

            {/* Rate bar */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${campaign.rate}%`, backgroundColor: campaign.color }}
                />
              </div>
              <span className="font-mono text-xs font-semibold text-text-primary w-8 text-right">
                {campaign.rate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
