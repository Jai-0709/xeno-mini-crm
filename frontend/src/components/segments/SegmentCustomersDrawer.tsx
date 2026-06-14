'use client';

import { useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { CustomerDrawer } from '@/components/customers/CustomerDrawer';
import { Users, Mail, Phone, MapPin, Search } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  filters: string;
  customerCount: number;
}

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

interface Props {
  segment: Segment | null;
  onClose: () => void;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function SegmentCustomersDrawer({ segment, onClose }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!segment) return;
    setLoading(true);
    // Fetch all customers first, then we can filter them by the segment's filters
    fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/customers')
      .then(r => r.json())
      .then((data: Customer[]) => {
        // Simple client-side filtering based on segment filters logic
        let parsedFilters: any = {};
        try { parsedFilters = JSON.parse(segment.filters || '{}'); } catch(e) {}
        
        let filtered = data;
        if (parsedFilters.tag) {
          filtered = filtered.filter(c => c.tag.toLowerCase() === parsedFilters.tag.toLowerCase());
        }
        if (parsedFilters.minSpend) {
          filtered = filtered.filter(c => c.totalSpend >= Number(parsedFilters.minSpend));
        }
        if (parsedFilters.daysSincePurchase) {
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - Number(parsedFilters.daysSincePurchase));
          filtered = filtered.filter(c => c.lastPurchaseDate && new Date(c.lastPurchaseDate) <= cutoff);
        }
        if (parsedFilters.city) {
          filtered = filtered.filter(c => c.city.toLowerCase() === parsedFilters.city.toLowerCase());
        }
        
        setCustomers(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [segment]);

  return (
    <>
      <Drawer open={!!segment} onClose={onClose} title={segment ? \`\${segment.name} Customers\` : 'Segment Customers'} width={480}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#111111', borderColor: '#1f1f1f' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ background: 'rgba(79,110,247,0.12)' }}>
                <Users className="w-5 h-5" style={{ color: '#4f6ef7' }} />
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: '#f0f0f0' }}>Total Customers</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>Matching criteria</div>
              </div>
            </div>
            <div className="text-xl font-mono font-semibold" style={{ color: '#4f6ef7' }}>
              {loading ? '-' : customers.length}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border shimmer" style={{ borderColor: '#1f1f1f', height: 72 }} />
              ))
            ) : customers.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#6b7280' }}>No customers match this segment</div>
            ) : (
              customers.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCustomer(c)}
                  className="p-3 flex items-center justify-between rounded-xl border cursor-pointer transition-colors" 
                  style={{ background: '#161616', borderColor: '#1f1f1f' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1f1f1f'; }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: c.avatarColor + '22', color: c.avatarColor }}>
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#f0f0f0' }}>{c.name}</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>{c.email}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>
      
      {selectedCustomer && (
        <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </>
  );
}
