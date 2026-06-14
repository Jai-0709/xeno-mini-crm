'use client';

import { useState, useEffect, useCallback } from 'react';
import { SegmentList } from '@/components/segments/SegmentList';
import { SegmentBuilder } from '@/components/segments/SegmentBuilder';
import { Filter } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';

interface Segment {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  createdAt: string;
  filters: string;
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Segment | null>(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/segments');
    const data = await res.json();
    setSegments(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSegments(); }, [fetchSegments]);

  async function handleDelete(id: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/segments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      addToast({ type: 'success', title: 'Segment deleted' });
      if (selected?.id === id) setSelected(null);
      fetchSegments();
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,92,191,0.12)' }}>
          <Filter className="w-5 h-5" style={{ color: '#7c5cbf' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f0' }}>Segments</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Create targeted audience segments for campaigns</p>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Segment list */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold" style={{ color: '#f0f0f0' }}>
            Saved Segments <span className="font-mono font-normal ml-1" style={{ color: '#6b7280' }}>({segments.length})</span>
          </h2>
          <SegmentList
            segments={segments}
            selected={selected}
            onSelect={setSelected}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>

        {/* Right: Builder */}
        <div className="rounded-xl border p-6" style={{ background: '#161616', borderColor: '#1f1f1f' }}>
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#f0f0f0' }}>Build New Segment</h2>
          <SegmentBuilder onSaved={fetchSegments} />
        </div>
      </div>
    </div>
  );
}
