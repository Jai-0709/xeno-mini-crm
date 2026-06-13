'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronUp, ChevronDown, X } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarColor: string;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  lastPurchaseDate: string | null;
  tag: string;
  createdAt: string;
}

type SortField = 'name' | 'totalSpend' | 'totalOrders' | 'lastPurchaseDate';

interface CustomerTableProps {
  onSelect: (c: Customer) => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  VIP:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  Regular: { color: '#4f6ef7', bg: 'rgba(79,110,247,0.12)' },
  'At-Risk': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  New:     { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  Loyal:   { color: '#7c5cbf', bg: 'rgba(124,92,191,0.12)' },
};

export function CustomerTable({ onSelect }: CustomerTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalSpend');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (tagFilter) params.set('tag', tagFilter);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/customers?${params}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  }, [search, tagFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const sorted = [...customers].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (sortField === 'lastPurchaseDate') {
      av = av ? new Date(av as string).getTime() : 0;
      bv = bv ? new Date(bv as string).getTime() : 0;
    }
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  }

  const tags = ['VIP','Regular','At-Risk','New','Loyal'];

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filter bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#6b7280' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: '#1a1a1a', borderColor: '#1f1f1f', color: '#f0f0f0' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {tags.map(t => {
            const tc = TAG_COLORS[t];
            return (
              <button
                key={t}
                onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                style={{
                  background: tagFilter === t ? tc.bg : 'transparent',
                  color: tagFilter === t ? tc.color : '#6b7280',
                  borderColor: tagFilter === t ? tc.color + '44' : '#1f1f1f',
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex gap-6 px-1">
        <span className="text-xs" style={{ color: '#6b7280' }}>
          <span className="font-mono font-semibold" style={{ color: '#f0f0f0' }}>{customers.length}</span> customers
        </span>
        <span className="text-xs" style={{ color: '#6b7280' }}>
          Total spend: <span className="font-mono font-semibold" style={{ color: '#f0f0f0' }}>
            ₹{customers.reduce((s, c) => s + c.totalSpend, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
        </span>
        <span className="text-xs" style={{ color: '#6b7280' }}>
          Avg order: <span className="font-mono font-semibold" style={{ color: '#f0f0f0' }}>
            ₹{customers.length ? Math.round(customers.reduce((s, c) => s + c.avgOrderValue, 0) / customers.length).toLocaleString('en-IN') : 0}
          </span>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: '#1f1f1f' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#111111', borderBottom: '1px solid #1f1f1f' }}>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6b7280' }}>Customer</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6b7280' }}>City</th>
              <th className="text-left px-4 py-3 font-medium" style={{ color: '#6b7280' }}>Tag</th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer select-none"
                style={{ color: sortField === 'totalSpend' ? '#f0f0f0' : '#6b7280' }}
                onClick={() => toggleSort('totalSpend')}
              >
                <span className="inline-flex items-center gap-1">
                  Total Spend <SortIcon field="totalSpend" />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer select-none"
                style={{ color: sortField === 'totalOrders' ? '#f0f0f0' : '#6b7280' }}
                onClick={() => toggleSort('totalOrders')}
              >
                <span className="inline-flex items-center gap-1">
                  Orders <SortIcon field="totalOrders" />
                </span>
              </th>
              <th
                className="text-right px-4 py-3 font-medium cursor-pointer select-none"
                style={{ color: sortField === 'lastPurchaseDate' ? '#f0f0f0' : '#6b7280' }}
                onClick={() => toggleSort('lastPurchaseDate')}
              >
                <span className="inline-flex items-center gap-1">
                  Last Purchase <SortIcon field="lastPurchaseDate" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #111111' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="shimmer rounded h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16" style={{ color: '#6b7280' }}>
                  No customers found
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {sorted.map((c, i) => {
                  const tc = TAG_COLORS[c.tag] || { color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      onClick={() => onSelect(c)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid #111111' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: c.avatarColor + '22', color: c.avatarColor }}
                          >
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: '#f0f0f0' }}>{c.name}</div>
                            <div className="text-xs" style={{ color: '#6b7280' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#6b7280' }}>{c.city}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {c.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: '#f0f0f0' }}>
                        ₹{c.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: '#f0f0f0' }}>
                        {c.totalOrders}
                      </td>
                      <td className="px-4 py-3 text-right text-xs" style={{ color: '#6b7280' }}>
                        {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
