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
  ChevronDown,
  ChevronRight,
  Activity,
  FileText,
  LifeBuoy,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  CircleDot
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { api } from '@/services/api';
import { useTheme } from '@/context/ThemeContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [adminName, setAdminName] = useState('Admin');
  const [pendingCounts, setPendingCounts] = useState<{ pendingDeposits: number; pendingWithdrawals: number }>({
    pendingDeposits: 0,
    pendingWithdrawals: 0
  });

  // Section collapse states
  const [navigateOpen, setNavigateOpen] = useState(true);
  const [gamesTreeOpen, setGamesTreeOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(true);
  const [linksOpen, setLinksOpen] = useState(true);

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

  const handleLogout = async () => {
    try {
      await api.post('/auth/admin/logout');
    } catch {}
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Modern Minimalist Adaptive Tree Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-raised border-r border-border-default transition-all duration-200 ease-in-out select-none ${
          collapsed ? 'w-[68px]' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-14 shrink-0 items-center justify-between px-3.5 border-b border-border-subtle">
          <Link
            href="/"
            className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-text-inverse font-black text-xs shadow-sm">
              BA
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-text-primary text-sm tracking-tight truncate flex items-center gap-1.5">
                  Bit Arcade
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                </span>
                <span className="text-xs text-text-tertiary truncate">
                  Admin Platform
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div className="hidden md:flex justify-center py-2 border-b border-border-subtle">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Tree Navigation Area */}
        <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          
          {/* Section 1: NAVIGATE */}
          <div className="space-y-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setNavigateOpen(!navigateOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
              >
                <span>Navigate</span>
                {navigateOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}

            {(navigateOpen || collapsed) && (
              <div className="space-y-1">
                {/* Dashboard */}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Dashboard' : undefined}
                  className={`group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <LayoutGrid className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Games Management - Tree Node with Sub-items */}
                <div>
                  <div
                    className={`flex items-center justify-between rounded-xl text-sm font-medium cursor-pointer transition-all ${
                      pathname.startsWith('/games') && !collapsed
                        ? 'text-text-primary bg-surface-strong/70'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                    } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                    onClick={() => {
                      if (collapsed) {
                        router.push('/games');
                        setMobileOpen(false);
                      } else {
                        setGamesTreeOpen(!gamesTreeOpen);
                      }
                    }}
                    title={collapsed ? 'Games' : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Gamepad2 className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      {!collapsed && <span>Games</span>}
                    </div>
                    {!collapsed && (
                      <span className="text-text-tertiary">
                        {gamesTreeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    )}
                  </div>

                  {/* Nested Tree Children with vertical connector lines */}
                  {!collapsed && gamesTreeOpen && (
                    <div className="relative ml-4 pl-3 border-l border-border-default space-y-1 mt-1 py-1">
                      <Link
                        href="/games"
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          pathname === '/games'
                            ? 'text-text-primary font-semibold bg-surface-strong'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/50'
                        }`}
                      >
                        <CircleDot className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>All Games Overview</span>
                      </Link>
                      <Link
                        href="/games?game=ring_of_future"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                        <span>Ring of Future</span>
                      </Link>
                      <Link
                        href="/games?game=tictactoe"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                      >
                        <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                        <span>Tic-Tac-Toe</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Deposits */}
                <Link
                  href="/payments/deposits"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? `Deposits (${pendingCounts.pendingDeposits})` : undefined}
                  className={`group relative flex items-center justify-between rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/payments/deposits')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ArrowDownLeft className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={1.8} />
                    {!collapsed && <span>Deposits</span>}
                  </div>
                  {!collapsed && pendingCounts.pendingDeposits > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 tabular-nums">
                      {pendingCounts.pendingDeposits}
                    </span>
                  )}
                </Link>

                {/* Withdrawals */}
                <Link
                  href="/payments/withdrawals"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? `Withdrawals (${pendingCounts.pendingWithdrawals})` : undefined}
                  className={`group relative flex items-center justify-between rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/payments/withdrawals')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-rose-500" strokeWidth={1.8} />
                    {!collapsed && <span>Withdrawals</span>}
                  </div>
                  {!collapsed && pendingCounts.pendingWithdrawals > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/25 tabular-nums">
                      {pendingCounts.pendingWithdrawals}
                    </span>
                  )}
                </Link>

                {/* Ledger */}
                <Link
                  href="/transactions/ledger"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Ledger' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/transactions/ledger')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <ArrowLeftRight className="h-5 w-5 shrink-0 text-blue-500" strokeWidth={1.8} />
                  {!collapsed && <span>Wallet Ledger</span>}
                </Link>

                {/* Players */}
                <Link
                  href="/users"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Players' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/users')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <Users className="h-5 w-5 shrink-0 text-purple-500" strokeWidth={1.8} />
                  {!collapsed && <span>Player Accounts</span>}
                </Link>

                {/* Promotions & VIP */}
                <Link
                  href="/promotions"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Promotions' : undefined}
                  className={`flex items-center justify-between rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/promotions')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Sparkles className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.8} />
                    {!collapsed && <span>Promotions</span>}
                  </div>
                  {!collapsed && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      Live
                    </span>
                  )}
                </Link>

                {/* Push Notifications */}
                <Link
                  href="/notifications"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Notifications' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/notifications')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <Bell className="h-5 w-5 shrink-0 text-sky-500" strokeWidth={1.8} />
                  {!collapsed && <span>Notifications</span>}
                </Link>
              </div>
            )}
          </div>

          {/* Section 2: MORE (Night Mode switch, System Settings, Diagnostics) */}
          <div className="space-y-1 pt-2 border-t border-border-subtle">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
              >
                <span>More</span>
                {moreOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}

            {(moreOpen || collapsed) && (
              <div className="space-y-1">
                {/* Night Mode Switch Toggle */}
                <div
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Night'} Mode`}
                  className={`flex items-center justify-between rounded-xl text-sm font-medium cursor-pointer transition-all text-text-secondary hover:text-text-primary hover:bg-surface-strong ${
                    collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 shrink-0 text-indigo-400" strokeWidth={1.8} />
                    ) : (
                      <Sun className="h-5 w-5 shrink-0 text-amber-500" strokeWidth={1.8} />
                    )}
                    {!collapsed && <span>Night Mode</span>}
                  </div>

                  {!collapsed && (
                    <div
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out ${
                          theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* System Settings */}
                <Link
                  href="/system/settings"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'Platform Settings' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/system/settings')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <Settings className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span>Settings</span>}
                </Link>

                {/* System Health / Diagnostics */}
                <Link
                  href="/system/health"
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? 'System Health' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                    isLinkActive('/system/health')
                      ? 'bg-accent-primary text-text-inverse shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                  } ${collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'}`}
                >
                  <Activity className="h-5 w-5 shrink-0 text-emerald-500" strokeWidth={1.8} />
                  {!collapsed && <span>System Health</span>}
                </Link>
              </div>
            )}
          </div>

          {/* Section 3: LINKS (Docs, Support) */}
          <div className="space-y-1 pt-2 border-t border-border-subtle">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setLinksOpen(!linksOpen)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
              >
                <span>Links</span>
                {linksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}

            {(linksOpen || collapsed) && (
              <div className="space-y-1">
                <a
                  href="/documentation"
                  target="_blank"
                  rel="noreferrer"
                  title={collapsed ? 'Documentation' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all ${
                    collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'
                  }`}
                >
                  <FileText className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span>Documentation</span>}
                </a>

                <a
                  href="https://t.me/"
                  target="_blank"
                  rel="noreferrer"
                  title={collapsed ? 'Contact Support' : undefined}
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all ${
                    collapsed ? 'justify-center w-10 h-10 mx-auto px-0' : 'px-3 py-2'
                  }`}
                >
                  <LifeBuoy className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {!collapsed && <span>Contact Support</span>}
                </a>
              </div>
            )}
          </div>

        </nav>

        {/* User Profile & Sign Out Footer */}
        <div className="shrink-0 p-3 border-t border-border-subtle bg-surface-base/60">
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center flex-col' : 'justify-between'}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-text-primary font-bold text-xs border border-border-default shadow-xs">
                {adminName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-surface-raised" />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {adminName}
                  </span>
                  <span className="text-xs text-text-tertiary truncate">
                    Superadmin
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out of admin session"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
