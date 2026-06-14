'use client';

import { motion } from 'framer-motion';
import { Users, Trash2, ChevronRight } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  createdAt: string;
  filters: string;
}

interface SegmentListProps {
  segments: Segment[];
  selected: Segment | null;
  onSelect: (s: Segment) => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export function SegmentList({ segments, selected, onSelect, onDelete, loading }: SegmentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border shimmer" style={{ borderColor: '#1f1f1f', height: 88 }} />
        ))}
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <Users className="w-10 h-10" style={{ color: '#3f3f46' }} />
        <p className="text-sm font-medium" style={{ color: '#6b7280' }}>No segments yet</p>
        <p className="text-xs" style={{ color: '#3f3f46' }}>Create your first segment using the builder →</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {segments.map((seg, i) => {
        const isSelected = selected?.id === seg.id;
        return (
          <motion.div
            key={seg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(seg)}
            className="p-4 rounded-xl border cursor-pointer transition-all"
            style={{
              background: isSelected ? 'rgba(79,110,247,0.08)' : '#161616',
              borderColor: isSelected ? '#4f6ef7' : '#1f1f1f',
            }}
            onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'; }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f1f'; }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate" style={{ color: '#f0f0f0' }}>{seg.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isSelected ? '#4f6ef7' : '#3f3f46' }} />
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#6b7280' }}>{seg.description}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Users className="w-3 h-3" style={{ color: '#4f6ef7' }} />
                  <span className="text-xs font-mono font-semibold" style={{ color: '#4f6ef7' }}>{seg.customerCount}</span>
                  <span className="text-xs" style={{ color: '#3f3f46' }}>customers</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); onDelete(seg.id); }}
                className="p-1.5 rounded-lg transition-colors flex-shrink-0 text-red-500/80 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
