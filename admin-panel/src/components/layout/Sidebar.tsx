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
  Circle
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

  // Expanded section collapse states
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

      {/* Modern Minimalist Monochrome Dock / Tree Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-raised border-r border-border-default transition-all duration-200 ease-in-out select-none ${
          collapsed ? 'w-[68px]' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* ============================================================== */}
        {/* CASE 1: COLLAPSED MODE (MINIMALIST MONOCHROME DOCK)            */}
        {/* ============================================================== */}
        {collapsed ? (
          <div className="flex flex-col h-full w-full items-center py-2.5">
            {/* Top Expand Toggle */}
            <div className="flex h-11 w-full items-center justify-center shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-all duration-150"
              >
                <PanelLeft className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <div className="w-8 h-px bg-border-subtle my-1.5 shrink-0" />

            {/* Navigation Icons Stack */}
            <nav className="flex-1 w-full flex flex-col items-center gap-1.5 overflow-y-auto px-3 py-1 scrollbar-none">
              {/* Dashboard */}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                title="Dashboard"
                aria-label="Dashboard"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <LayoutGrid className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Games */}
              <Link
                href="/games"
                onClick={() => setMobileOpen(false)}
                title="Games Management"
                aria-label="Games Management"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/games')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Gamepad2 className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Deposits */}
              <Link
                href="/payments/deposits"
                onClick={() => setMobileOpen(false)}
                title={`Deposits (${pendingCounts.pendingDeposits} pending)`}
                aria-label="Deposits"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/payments/deposits')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <ArrowDownLeft className="h-5 w-5" strokeWidth={1.8} />
                {pendingCounts.pendingDeposits > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary ring-2 ring-surface-raised" />
                )}
              </Link>

              {/* Withdrawals */}
              <Link
                href="/payments/withdrawals"
                onClick={() => setMobileOpen(false)}
                title={`Withdrawals (${pendingCounts.pendingWithdrawals} pending)`}
                aria-label="Withdrawals"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/payments/withdrawals')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <ArrowUpRight className="h-5 w-5" strokeWidth={1.8} />
                {pendingCounts.pendingWithdrawals > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary ring-2 ring-surface-raised" />
                )}
              </Link>

              {/* Ledger */}
              <Link
                href="/transactions/ledger"
                onClick={() => setMobileOpen(false)}
                title="Wallet Ledger"
                aria-label="Wallet Ledger"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/transactions/ledger')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <ArrowLeftRight className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Player Accounts */}
              <Link
                href="/users"
                onClick={() => setMobileOpen(false)}
                title="Player Accounts"
                aria-label="Player Accounts"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/users')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Users className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Promotions */}
              <Link
                href="/promotions"
                onClick={() => setMobileOpen(false)}
                title="Promotions & VIP"
                aria-label="Promotions & VIP"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/promotions')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Sparkles className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                onClick={() => setMobileOpen(false)}
                title="Push Notifications"
                aria-label="Push Notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/notifications')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Bell className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Section Divider */}
              <div className="w-8 h-px bg-border-subtle my-1 shrink-0" />

              {/* Theme Toggle (Night / Light) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Night'} Mode`}
                aria-label="Toggle theme"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5" strokeWidth={1.8} />
                ) : (
                  <Sun className="h-5 w-5" strokeWidth={1.8} />
                )}
              </button>

              {/* Settings */}
              <Link
                href="/system/settings"
                onClick={() => setMobileOpen(false)}
                title="Platform Settings"
                aria-label="Platform Settings"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/system/settings')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Settings className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* System Health */}
              <Link
                href="/system/health"
                onClick={() => setMobileOpen(false)}
                title="System Health & Diagnostics"
                aria-label="System Health"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/system/health')
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <Activity className="h-5 w-5" strokeWidth={1.8} />
              </Link>

              {/* Section Divider */}
              <div className="w-8 h-px bg-border-subtle my-1 shrink-0" />

              {/* Documentation */}
              <a
                href="/documentation"
                target="_blank"
                rel="noreferrer"
                title="Documentation"
                aria-label="Documentation"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                <FileText className="h-5 w-5" strokeWidth={1.8} />
              </a>

              {/* Support */}
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                title="Contact Support"
                aria-label="Contact Support"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                <LifeBuoy className="h-5 w-5" strokeWidth={1.8} />
              </a>
            </nav>

            <div className="w-8 h-px bg-border-subtle my-1.5 shrink-0" />

            {/* Collapsed Footer Profile & Logout */}
            <div className="shrink-0 flex flex-col items-center gap-2 pt-1">
              <div
                title={`${adminName} (Superadmin)`}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface-strong text-text-primary font-bold text-xs border border-border-default shadow-xs"
              >
                {adminName.slice(0, 2).toUpperCase()}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-primary ring-2 ring-surface-raised" />
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out of admin session"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-colors"
              >
                <LogOut className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: EXPANDED MODE (MONOCHROME MINIMALIST TREE SIDEBAR)      */
          /* ============================================================== */
          <>
            {/* Workspace Brand Header */}
            <div className="flex h-14 shrink-0 items-center justify-between px-3.5 border-b border-border-subtle">
              <Link
                href="/"
                className="flex items-center gap-2.5 overflow-hidden group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-primary text-text-inverse font-black text-xs shadow-sm">
                  BA
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-text-primary text-sm tracking-tight truncate">
                    Bit Arcade
                  </span>
                  <span className="text-xs text-text-tertiary truncate">
                    Admin Platform
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-5 w-5" />
              </button>
            </div>

            {/* Tree Navigation Area */}
            <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              
              {/* Section 1: NAVIGATE */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setNavigateOpen(!navigateOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
                >
                  <span>Navigate</span>
                  {navigateOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {navigateOpen && (
                  <div className="space-y-1">
                    {/* Dashboard */}
                    <Link
                      href="/"
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <LayoutGrid className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Dashboard</span>
                    </Link>

                    {/* Games Management - Tree Node with Sub-items */}
                    <div>
                      <div
                        className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                          pathname.startsWith('/games')
                            ? 'text-text-primary bg-surface-strong/70'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                        }`}
                        onClick={() => setGamesTreeOpen(!gamesTreeOpen)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Gamepad2 className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                          <span>Games</span>
                        </div>
                        <span className="text-text-tertiary group-hover:text-text-primary transition-colors">
                          {gamesTreeOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </span>
                      </div>

                      {/* Nested Tree Children with vertical connector lines */}
                      {gamesTreeOpen && (
                        <div className="relative ml-4 pl-3 border-l border-border-default space-y-1 mt-1 py-1">
                          <Link
                            href="/games"
                            onClick={() => setMobileOpen(false)}
                            className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              pathname === '/games'
                                ? 'text-text-primary font-semibold bg-surface-strong'
                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/50'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>All Games Overview</span>
                          </Link>
                          <Link
                            href="/games?game=ring_of_future"
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>Ring of Future</span>
                          </Link>
                          <Link
                            href="/games?game=tictactoe"
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-text-tertiary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>Tic-Tac-Toe</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Deposits */}
                    <Link
                      href="/payments/deposits"
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/payments/deposits')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ArrowDownLeft className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                        <span>Deposits</span>
                      </div>
                      {pendingCounts.pendingDeposits > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-surface-strong text-text-primary border border-border-default tabular-nums">
                          {pendingCounts.pendingDeposits}
                        </span>
                      )}
                    </Link>

                    {/* Withdrawals */}
                    <Link
                      href="/payments/withdrawals"
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/payments/withdrawals')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ArrowUpRight className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                        <span>Withdrawals</span>
                      </div>
                      {pendingCounts.pendingWithdrawals > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-surface-strong text-text-primary border border-border-default tabular-nums">
                          {pendingCounts.pendingWithdrawals}
                        </span>
                      )}
                    </Link>

                    {/* Ledger */}
                    <Link
                      href="/transactions/ledger"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/transactions/ledger')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <ArrowLeftRight className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Wallet Ledger</span>
                    </Link>

                    {/* Players */}
                    <Link
                      href="/users"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/users')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <Users className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Player Accounts</span>
                    </Link>

                    {/* Promotions & VIP */}
                    <Link
                      href="/promotions"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/promotions')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Sparkles className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                        <span>Promotions</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-strong text-text-secondary border border-border-default">
                        Live
                      </span>
                    </Link>

                    {/* Push Notifications */}
                    <Link
                      href="/notifications"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/notifications')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <Bell className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Notifications</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Section 2: MORE (Night Mode switch, System Settings, Diagnostics) */}
              <div className="space-y-1 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
                >
                  <span>More</span>
                  {moreOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {moreOpen && (
                  <div className="space-y-1">
                    {/* Night Mode Switch Toggle */}
                    <div
                      onClick={toggleTheme}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-all text-text-secondary hover:text-text-primary hover:bg-surface-strong"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {theme === 'dark' ? (
                          <Moon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                        ) : (
                          <Sun className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                        )}
                        <span>Night Mode</span>
                      </div>

                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          theme === 'dark' ? 'bg-accent-primary' : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out ${
                            theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* System Settings */}
                    <Link
                      href="/system/settings"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/system/settings')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <Settings className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Settings</span>
                    </Link>

                    {/* System Health / Diagnostics */}
                    <Link
                      href="/system/health"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/system/health')
                          ? 'bg-accent-primary text-text-inverse shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                      }`}
                    >
                      <Activity className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>System Health</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Section 3: LINKS (Docs, Support) */}
              <div className="space-y-1 pt-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setLinksOpen(!linksOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-text-tertiary tracking-wider uppercase hover:text-text-secondary transition-colors"
                >
                  <span>Links</span>
                  {linksOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>

                {linksOpen && (
                  <div className="space-y-1">
                    <a
                      href="/documentation"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all"
                    >
                      <FileText className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Documentation</span>
                    </a>

                    <a
                      href="https://t.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all"
                    >
                      <LifeBuoy className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                      <span>Contact Support</span>
                    </a>
                  </div>
                )}
              </div>

            </nav>

            {/* User Profile & Sign Out Footer */}
            <div className="shrink-0 p-3 border-t border-border-subtle bg-surface-base/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-text-primary font-bold text-xs border border-border-default shadow-xs">
                    {adminName.slice(0, 2).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-primary ring-2 ring-surface-raised" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {adminName}
                    </span>
                    <span className="text-xs text-text-tertiary truncate">
                      Superadmin
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out of admin session"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-strong transition-colors shrink-0"
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
