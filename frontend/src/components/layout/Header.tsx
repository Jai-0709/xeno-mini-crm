'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Plus, X, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';

const pageTitles: Record<string, string> = {
  '/app/dashboard':    'Dashboard',
  '/app/customers':    'Customers',
  '/app/segments':     'Segments',
  '/app/campaigns':    'Campaigns',
  '/app/analytics':    'Analytics',
  '/app/ai-assistant': 'AI Assistant',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = pageTitles[pathname] ?? 'Lumora CRM';
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ customers: any[], campaigns: any[], segments: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const toggleSidebar = useLayoutStore(state => state.toggleSidebar);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="fixed top-0 left-0 md:left-60 right-0 h-16 bg-bg-sidebar/80 backdrop-blur-md border-b border-border z-20 flex items-center px-4 md:px-6 gap-4">
      {/* Hamburger Menu & Title */}
      {!searchOpen && (
        <div className="flex items-center gap-3 flex-1">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        </div>
      )}

      {/* Inline Search */}
      {searchOpen && (
        <div className="flex-1 flex items-center gap-2 relative">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/app/customers?search=${encodeURIComponent(searchQuery)}`);
                  setSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults(null);
                }
              }}
              placeholder="Search customers, campaigns, segments..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none"
              style={{ background: '#1a1a1a', borderColor: '#2a2a2a', color: '#f0f0f0' }}
            />

            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-2xl overflow-hidden z-50 flex flex-col max-h-[70vh] overflow-y-auto" style={{ background: '#161616', borderColor: '#2a2a2a' }}>
                {isSearching ? (
                  <div className="p-4 text-sm text-text-muted text-center">Searching...</div>
                ) : searchResults ? (
                  <>
                    {(searchResults.customers.length === 0 && searchResults.campaigns.length === 0 && searchResults.segments.length === 0) ? (
                      <div className="p-4 text-sm text-text-muted text-center">No results found</div>
                    ) : (
                      <>
                        {searchResults.customers.length > 0 && (
                          <div className="flex flex-col border-b last:border-b-0" style={{ borderColor: '#2a2a2a' }}>
                            <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ background: '#111111' }}>Customers</div>
                            {searchResults.customers.map(c => (
                              <button key={c.id} onClick={() => { router.push(`/app/customers?search=${c.name}`); setSearchOpen(false); }} className="px-4 py-3 text-left hover:bg-white/[0.05] transition-colors flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-text-primary">{c.name}</span>
                                <span className="text-xs text-text-secondary">{c.email} • {c.city}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.campaigns.length > 0 && (
                          <div className="flex flex-col border-b last:border-b-0" style={{ borderColor: '#2a2a2a' }}>
                            <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ background: '#111111' }}>Campaigns</div>
                            {searchResults.campaigns.map(c => (
                              <button key={c.id} onClick={() => { router.push('/app/campaigns'); setSearchOpen(false); }} className="px-4 py-3 text-left hover:bg-white/[0.05] transition-colors flex items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">{c.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(79,110,247,0.12)', color: '#4f6ef7' }}>{c.status}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults.segments.length > 0 && (
                          <div className="flex flex-col border-b last:border-b-0" style={{ borderColor: '#2a2a2a' }}>
                            <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider" style={{ background: '#111111' }}>Segments</div>
                            {searchResults.segments.map(s => (
                              <button key={s.id} onClick={() => { router.push('/app/segments'); setSearchOpen(false); }} className="px-4 py-3 text-left hover:bg-white/[0.05] transition-colors flex items-center justify-between">
                                <span className="text-sm font-medium text-text-primary">{s.name}</span>
                                <span className="text-xs text-text-muted">{s.customerCount} customers</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
          <button
            onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(n => !n)}
            className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-status-danger rounded-full border-2 border-surface" />
          </button>
          {showNotif && (
            <div
              className="absolute right-0 top-12 w-72 rounded-xl border shadow-2xl z-50 p-4 flex flex-col gap-3"
              style={{ background: '#161616', borderColor: '#2a2a2a' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-primary">Notifications</p>
                <button onClick={() => setShowNotif(false)} className="text-[10px] text-accent-blue hover:underline">Mark all read</button>
              </div>
              {[
                { title: 'Campaign launched', desc: 'Diwali Sale reached 1,200 customers', time: '2m ago' },
                { title: 'Segment updated', desc: 'Mumbai VIPs now has 34 customers', time: '1h ago' },
                { title: 'Delivery report ready', desc: 'Summer Flash open rate: 52%', time: '3h ago' },
              ].map((n, i) => (
                <div key={i} className="flex flex-col gap-0.5 p-2.5 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors" style={{ background: '#1a1a1a' }}>
                  <span className="text-xs font-semibold text-text-primary">{n.title}</span>
                  <span className="text-xs text-text-secondary">{n.desc}</span>
                  <span className="text-xs text-text-muted mt-0.5">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* <span className="hidden md:inline">New Campaign</span> */}
        <button
          onClick={() => router.push('/app/campaigns')}
          className="btn-gradient flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Campaign</span>
        </button>
      </div>
    </header>
  );
}

