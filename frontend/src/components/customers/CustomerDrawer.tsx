'use client';

import { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShoppingBag, Mail, Phone, MapPin, Tag } from 'lucide-react';

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
}

interface Order {
  id: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface DetailData extends Customer {
  orders: Order[];
}

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const TABS = ['Overview', 'Orders'] as const;
type Tab = typeof TABS[number];

export function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');

  useEffect(() => {
    if (!customer) return;
    setTab('Overview');
    setDetail(null);
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/customers/${customer.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); });
  }, [customer]);

  const data = detail || customer;

  return (
    <Drawer open={!!customer} onClose={onClose} title="Customer Profile" width={480}>
      {!data ? null : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
              style={{ background: data.avatarColor + '22', color: data.avatarColor }}
            >
              {getInitials(data.name)}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#f0f0f0' }}>{data.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
                <span className="text-sm" style={{ color: '#6b7280' }}>{data.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-3.5 h-3.5" style={{ color: '#6b7280' }} />
                <span className="text-sm" style={{ color: '#6b7280' }}>{data.phone}</span>
              </div>
            </div>
          </div>

          {/* Info pills */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: '#1a1a1a', color: '#6b7280' }}>
              <MapPin className="w-3 h-3" />{data.city}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: '#1a1a1a', color: '#6b7280' }}>
              <Tag className="w-3 h-3" />{data.tag}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#111111' }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-md text-sm font-medium transition-all"
                style={{
                  background: tab === t ? '#1f1f1f' : 'transparent',
                  color: tab === t ? '#f0f0f0' : '#6b7280',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'Overview' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Spend', value: `₹${data.totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                { label: 'Total Orders', value: data.totalOrders },
                { label: 'Avg Order', value: `₹${data.avgOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                { label: 'Last Purchase', value: data.lastPurchaseDate ? new Date(data.lastPurchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—' },
              ].map(m => (
                <div key={m.label} className="p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
                  <div className="text-xs mb-1" style={{ color: '#6b7280' }}>{m.label}</div>
                  <div className="text-lg font-mono font-semibold" style={{ color: '#f0f0f0' }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Orders' && (
            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-xl border shimmer" style={{ borderColor: '#1f1f1f', height: 72 }} />
                ))
              ) : detail?.orders?.length === 0 ? (
                <div className="text-center py-8" style={{ color: '#6b7280' }}>No orders found</div>
              ) : (
                detail?.orders?.map(o => (
                  <div key={o.id} className="p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: '#1a1a1a' }}>
                          <ShoppingBag className="w-4 h-4" style={{ color: '#4f6ef7' }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: '#f0f0f0' }}>{o.productName}</div>
                          <div className="text-xs" style={{ color: '#6b7280' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-sm" style={{ color: '#f0f0f0' }}>
                          ₹{o.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
