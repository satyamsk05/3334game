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
  PanelLeftClose,
  PanelLeft
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
    badge?: { text: string; variant: 'emerald' | 'cyan' | 'zinc' };
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
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutGrid },
        { name: 'Players', href: '/users', icon: Users },
        { name: 'Game Engine', href: '/games', icon: Gamepad2 }
      ]
    },
    {
      title: 'Financial desk',
      items: [
        { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft, countKey: 'deposits' },
        { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight, countKey: 'withdrawals' },
        { name: 'Wallet Ledger', href: '/transactions/ledger', icon: ArrowLeftRight }
      ]
    },
    {
      title: 'Growth & alerts',
      items: [
        { name: 'Push Notifications', href: '/notifications', icon: Bell, badge: { text: 'FCM', variant: 'cyan' } },
        { name: 'Promotions & Banners', href: '/promotions', icon: Sparkles, badge: { text: 'Live', variant: 'emerald' } }
      ]
    },
    {
      title: 'System',
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sleek Minimalist Dark Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#09090b] border-r border-white/[0.08] transition-all duration-200 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-60'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Collapse Control */}
        <div className="flex h-14 shrink-0 items-center justify-between px-3.5 border-b border-white/[0.06]">
          <Link
            href="/"
            className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-black font-black text-xs shadow-sm">
              334
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-xs tracking-tight truncate">
                  334 Gaming
                </span>
                <span className="text-[11px] text-zinc-500 font-normal truncate">
                  Admin
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-b border-white/[0.04]">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Section Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={section.title || sIdx} className="space-y-0.5">
              {section.title && !collapsed && (
                <div className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-zinc-500">
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
                    className={`group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    } ${collapsed ? 'justify-center px-0 h-8' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                          aria-hidden="true"
                        />
                        {/* Dot indicator on collapsed view */}
                        {collapsed && count > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
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
                      <span className="flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[10px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/25">
                        {count}
                      </span>
                    )}

                    {/* Optional Tag Badges */}
                    {!collapsed && !count && item.badge && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        item.badge.variant === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-white/[0.08]'
                      }`}>
                        {item.badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="shrink-0 p-2.5 border-t border-white/[0.06] bg-black/40">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center flex-col' : 'justify-between'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-white font-semibold text-[11px] ring-1 ring-white/10">
                {adminName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-black" />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-white truncate">
                    {adminName}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate">
                    Superadmin
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className={`flex items-center justify-center rounded-md p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ${
                collapsed ? 'w-7 h-7' : ''
              }`}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
