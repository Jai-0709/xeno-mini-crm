'use client';

const channelConfig: Record<string, { label: string; color: string; bg: string }> = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)' },
  sms:      { label: 'SMS',      color: '#4f6ef7', bg: 'rgba(79,110,247,0.12)' },
  email:    { label: 'Email',    color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)' },
  rcs:      { label: 'RCS',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

export function ChannelPill({ channel, size = 'sm' }: { channel: string; size?: 'xs' | 'sm' | 'md' }) {
  const cfg = channelConfig[channel.toLowerCase()] ?? { label: channel, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : size === 'md' ? 'text-xs px-3 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

export function getChannelColor(channel: string) {
  return channelConfig[channel.toLowerCase()]?.color ?? '#6b7280';
}
