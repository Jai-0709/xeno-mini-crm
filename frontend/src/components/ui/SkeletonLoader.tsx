'use client';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

import React from 'react';

export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`shimmer rounded ${className}`} style={style} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-bg-card border border-border rounded-card p-5 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-bg-card border border-border rounded-card p-5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-20 rounded-btn" />
        <Skeleton className="h-8 w-20 rounded-btn" />
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="bg-bg-card border border-border rounded-card p-5">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className={`w-full rounded`} style={{ height }} />
    </div>
  );
}
