'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Gamepad2,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  BarChart3,
  FileSpreadsheet,
  LifeBuoy,
  Server,
  Settings,
  ShieldCheck,
  FileText,
  PanelLeft,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavSection {
  title?: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: { text: string; variant: 'peach' | 'mint' | 'info' | 'neutral' };
  }[];
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminUser');
      if (stored) setAdminName(stored);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutGrid },
        { name: 'Players', href: '/users', icon: Users },
        { name: 'Games', href: '/games', icon: Gamepad2 }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft },
        { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight },
        { name: 'Wallet Ledger', href: '/transactions/ledger', icon: ArrowLeftRight }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
        { name: 'Support', href: '/support', icon: LifeBuoy }
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { name: 'System Health', href: '/system/health', icon: Server },
        { name: 'Settings', href: '/system/settings', icon: Settings },
        { name: 'Staff Admins', href: '/security/admins', icon: ShieldCheck },
        { name: 'Audit Logs', href: '/security/audit-logs', icon: FileText }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm md:hidden transition-fast"
          aria-hidden="true"
        />
      )}

      {/* Main Soft Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed top-4 bottom-4 z-50 flex flex-col rounded-[28px] bg-[#f8f9fb] border border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-normal ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'left-4' : '-left-[300px] md:left-4'
        }`}
      >
        <div className="flex h-full flex-col p-4 overflow-hidden">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between pb-4 pt-1 px-1">
            <Link href="/" className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md relative overflow-hidden">
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div className="bg-white/90 rounded-tl-sm" />
                  <div className="bg-white/40 rounded-tr-sm" />
                  <div className="bg-white/40 rounded-bl-sm" />
                  <div className="bg-white/90 rounded-br-sm" />
                </div>
              </div>
              <div className={`flex flex-col whitespace-nowrap transition-normal ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                <span className="font-extrabold text-gray-900 text-base tracking-tight font-sans">334 Studio</span>
                <span className="text-xs text-gray-400 font-medium">Authoritative Portal</span>
              </div>
            </Link>

            {/* Collapse Toggle */}
            <button
              type="button"
              onClick={() => setCollapsed((prev: boolean) => !prev)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Direct Flat Navigation Items */}
          <div className="mt-2 flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
            {navSections.map((section, sIdx) => (
              <div key={section.title || sIdx} className="space-y-1">
                {section.title && !collapsed && (
                  <div className="px-3 pb-1 pt-1 text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-fast ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 shrink-0 transition-fast ${
                            isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`truncate transition-normal ${
                            collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      {!collapsed && item.badge && (
                        <Badge variant={item.badge.variant}>
                          {item.badge.text}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User Profile & Logout Bottom Card */}
          <div className="pt-3 border-t border-gray-200/60 space-y-2">
            <div className={`flex items-center gap-3 rounded-2xl bg-white p-2.5 border border-gray-100 shadow-sm ${
              collapsed ? 'justify-center p-1.5' : ''
            }`}>
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                {adminName.slice(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className={`flex flex-col overflow-hidden ${collapsed ? 'hidden' : 'inline'}`}>
                <span className="text-xs font-bold text-gray-900 truncate">{adminName}</span>
                <span className="text-[11px] text-gray-400">Platform Admin</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50/80 transition-fast ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={collapsed ? 'hidden' : 'inline'}>Sign out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
