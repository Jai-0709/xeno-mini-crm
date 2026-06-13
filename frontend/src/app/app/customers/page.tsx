'use client';

import { useState } from 'react';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerDrawer } from '@/components/customers/CustomerDrawer';
import { Users } from 'lucide-react';

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

export default function CustomersPage() {
  const [selected, setSelected] = useState<Customer | null>(null);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(79,110,247,0.12)' }}>
          <Users className="w-5 h-5" style={{ color: '#4f6ef7' }} />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#f0f0f0' }}>Customers</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>View and manage your customer base</p>
        </div>
      </div>

      {/* Table */}
      <CustomerTable onSelect={setSelected} />

      {/* Drawer */}
      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
