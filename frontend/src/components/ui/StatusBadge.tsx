'use client';

const statusConfig: Record<string, { label: string; color: string; bg: string; pulse?: boolean }> = {
  completed:  { label: 'Completed',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  running:    { label: 'Running',    color: '#4f6ef7', bg: 'rgba(79,110,247,0.12)', pulse: true },
  scheduled:  { label: 'Scheduled',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  failed:     { label: 'Failed',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  draft:      { label: 'Draft',      color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  queued:     { label: 'Queued',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  sent:       { label: 'Sent',       color: '#4f6ef7', bg: 'rgba(79,110,247,0.12)' },
  delivered:  { label: 'Delivered',  color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  opened:     { label: 'Opened',     color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)' },
  clicked:    { label: 'Clicked',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  active:     { label: 'Active',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'at-risk':  { label: 'At-Risk',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  churned:    { label: 'Churned',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  new:        { label: 'New',        color: '#4f6ef7', bg: 'rgba(79,110,247,0.12)' },
  vip:        { label: 'VIP',        color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)' },
  regular:    { label: 'Regular',    color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status.toLowerCase()] ?? { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.pulse ? 'badge-running' : ''}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}
