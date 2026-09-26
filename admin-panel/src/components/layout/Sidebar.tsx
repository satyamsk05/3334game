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
import { adminService } from '@/services/adminService';

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
    countKey?: 'deposits' | 'withdrawals';
    badge?: { text: string; variant: 'peach' | 'mint' | 'info' | 'neutral' };
  }[];
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [pendingCounts, setPendingCounts] = useState<{ pendingDeposits: number; pendingWithdrawals: number }>({
    pendingDeposits: 0,
    pendingWithdrawals: 0
  });

  const fetchCounts = async () => {
    try {
      const res = await adminService.getPendingCounts();
      if (res.success && res.data) {
        setPendingCounts({
          pendingDeposits: res.data.pendingDeposits || 0,
          pendingWithdrawals: res.data.pendingWithdrawals || 0
        });
      }
    } catch (_e) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminUser');
      if (stored) setAdminName(stored);
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 8000);
    return () => clearInterval(interval);
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
        { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft, countKey: 'deposits' },
        { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight, countKey: 'withdrawals' },
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
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200/80 text-gray-500 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all duration-150 ease-out active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent-primary"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className={`h-4 w-4 transition-transform duration-200 ease-out ${collapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
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

                  const count = item.countKey === 'deposits' 
                    ? pendingCounts.pendingDeposits 
                    : (item.countKey === 'withdrawals' ? pendingCounts.pendingWithdrawals : 0);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? `${item.name} ${count > 0 ? `(${count} pending)` : ''}` : undefined}
                      className={`group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.98] ${
                        isActive
                          ? 'bg-white text-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <div className="flex items-center gap-3 relative">
                        <div className="relative">
                          <Icon
                            className={`h-5 w-5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                              isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-800'
                            }`}
                            aria-hidden="true"
                          />
                          {collapsed && count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                          )}
                        </div>
                        <span
                          className={`truncate transition-opacity duration-150 ${
                            collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      {!collapsed && count > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white bg-rose-500 shadow-sm animate-pulse">
                          {count}
                        </span>
                      )}

                      {!collapsed && !count && item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* User Profile & Logout Bottom Card */}
          <div className="pt-3 border-t border-gray-200/60 space-y-2">
            <div className={`flex items-center gap-3 rounded-2xl bg-white p-2.5 border border-gray-100 shadow-sm transition-all duration-150 ${
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
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all duration-150 ease-out active:scale-[0.96] ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="h-4 w-4 shrink-0 transition-transform duration-150" aria-hidden="true" />
              <span className={collapsed ? 'hidden' : 'inline'}>Sign out</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
