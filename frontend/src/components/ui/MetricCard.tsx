'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon: React.ReactNode;
  glowColor?: string;
  prefix?: string;
  suffix?: string;
}

export function MetricCard({ title, value, delta, icon, glowColor = '#4f6ef7', prefix = '', suffix = '' }: MetricCardProps) {
  const isPositive = (delta ?? 0) >= 0;

  return (
    <div
      className="bg-bg-card border border-border rounded-card p-5 hover-lift click-scale relative overflow-hidden group transition-all duration-150"
      style={{ '--glow': glowColor } as React.CSSProperties}
    >
      {/* Bottom glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-8 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"
        style={{ background: glowColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</p>
        <div className="text-text-muted opacity-70">{icon}</div>
      </div>

      {/* Value */}
      <p className="font-mono text-3xl font-bold text-text-primary tracking-tight">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>

      {/* Delta */}
      {delta !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{delta.toFixed(1)}% vs last period
        </div>
      )}
    </div>
  );
}
