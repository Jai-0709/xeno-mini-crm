'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Filter, Send, BarChart2, Sparkles, Zap, Home, X
} from 'lucide-react';
import { useLayoutStore } from '@/store/useLayoutStore';

const navItems = [
  { href: '/',                label: 'Home',         icon: Home,            isExternal: true },
  { href: '/app/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/app/customers',   label: 'Customers',    icon: Users },
  { href: '/app/segments',    label: 'Segments',     icon: Filter },
  { href: '/app/campaigns',   label: 'Campaigns',    icon: Send },
  { href: '/app/analytics',   label: 'Analytics',    icon: BarChart2 },
  { href: '/app/ai-assistant',label: 'AI Assistant', icon: Sparkles, isAI: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useLayoutStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 bottom-0 w-60 bg-bg-sidebar border-r border-border flex flex-col z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-base text-text-primary tracking-tight">Lumora CRM</span>
        </div>
        <button className="md:hidden text-text-secondary hover:text-text-primary" onClick={() => setSidebarOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, isAI, isExternal }) => {
          const active = !isExternal && (pathname === href || pathname.startsWith(href + '/'));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-bg-active text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-blue rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-accent-blue' : 'text-text-muted group-hover:text-text-secondary'} transition-colors`} />
              <span>{label}</span>
              {isAI && (
                <span className="ml-auto flex items-center gap-1">
                  <span className="pulse-dot w-2 h-2 rounded-full bg-status-success" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
}
