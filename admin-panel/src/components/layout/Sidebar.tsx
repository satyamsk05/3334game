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
  Settings,
  LogOut,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity
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
    badge?: { text: string; variant: 'blue' | 'emerald' | 'amber' | 'purple' };
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
        { name: 'Game Engine', href: '/games', icon: Gamepad2 }
      ]
    },
    {
      title: 'FINANCIAL DESK',
      items: [
        { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft, countKey: 'deposits' },
        { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight, countKey: 'withdrawals' },
        { name: 'Wallet Ledger', href: '/transactions/ledger', icon: ArrowLeftRight }
      ]
    },
    {
      title: 'GROWTH & ALERTS',
      items: [
        { name: 'Push Notifications', href: '/notifications', icon: Bell, badge: { text: 'FCM', variant: 'blue' } },
        { name: 'Promotions & Banners', href: '/promotions', icon: Sparkles, badge: { text: 'Live', variant: 'emerald' } }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Platform Settings', href: '/system/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Clean Docked Light Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200/80 shadow-xs transition-all duration-200 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-100">
          <Link
            href="/"
            className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            {/* Logo Badge */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm ring-1 ring-gray-900/10">
              <Shield className="h-4 w-4 text-emerald-400" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-950 text-sm tracking-tight truncate font-sans">
                    334 Gaming
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Admin
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 font-medium truncate">
                  Authoritative Control
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button (Centered beneath header) */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-1">
              {section.title && !collapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-bold tracking-wider text-gray-400 uppercase font-mono">
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
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100/80'
                    } ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-500 group-hover:text-gray-900'
                          }`}
                          aria-hidden="true"
                        />
                        {/* Dot badge on collapsed view */}
                        {collapsed && count > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                          </span>
                        )}
                      </div>

                      {!collapsed && (
                        <span className="truncate">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Pending Count Badges on Expanded */}
                    {!collapsed && count > 0 && (
                      <span
                        className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {count}
                      </span>
                    )}

                    {/* Optional Tag Badges */}
                    {!collapsed && !count && item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge.variant === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
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
        <div className="shrink-0 p-3 border-t border-gray-100 bg-gray-50/50">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center flex-col' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-800 font-bold text-xs ring-1 ring-gray-300">
                {adminName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-900 truncate">
                    {adminName}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium truncate">
                    Super Admin
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out of platform"
              className={`flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${
                collapsed ? 'w-8 h-8' : ''
              }`}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
