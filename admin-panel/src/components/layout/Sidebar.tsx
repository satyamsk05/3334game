'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import {
  IconDashboard,
  IconGamepad,
  IconWallet,
  IconWithdraw,
  IconTransactions,
  IconPlayers,
  IconCrown,
  IconBell,
  IconSettings,
  IconChart,
  IconBook,
  IconChat,
  IconLogOut,
  IconMoonSolid,
  IconSunSolid
} from '@/components/icons/GamingIcons';
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

      {/* Modern Casino/Gaming Minimalist Dock Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-raised border-r border-border-default transition-all duration-200 ease-in-out select-none ${
          collapsed ? 'w-[68px]' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* ============================================================== */}
        {/* CASE 1: COLLAPSED MODE (SOLID GAMING ICON DOCK / RAIL)         */}
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all duration-150"
              >
                <PanelLeft className="h-5 w-5" />
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
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconDashboard size={20} />
              </Link>

              {/* Games */}
              <Link
                href="/games"
                onClick={() => setMobileOpen(false)}
                title="Games Management"
                aria-label="Games Management"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/games')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconGamepad size={20} />
              </Link>

              {/* Deposits */}
              <Link
                href="/payments/deposits"
                onClick={() => setMobileOpen(false)}
                title={`Deposits (${pendingCounts.pendingDeposits} pending)`}
                aria-label="Deposits"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/payments/deposits')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconWallet size={20} />
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
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconWithdraw size={20} />
                {pendingCounts.pendingWithdrawals > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-primary ring-2 ring-surface-raised" />
                )}
              </Link>

              {/* Ledger */}
              <Link
                href="/transactions/ledger"
                onClick={() => setMobileOpen(false)}
                title="Wallet Ledger & Transactions"
                aria-label="Wallet Ledger & Transactions"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/transactions/ledger')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconTransactions size={20} />
              </Link>

              {/* Player Accounts */}
              <Link
                href="/users"
                onClick={() => setMobileOpen(false)}
                title="Player Accounts"
                aria-label="Player Accounts"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/users')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconPlayers size={20} />
              </Link>

              {/* Promotions */}
              <Link
                href="/promotions"
                onClick={() => setMobileOpen(false)}
                title="VIP Club & Promotions"
                aria-label="VIP Club & Promotions"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/promotions')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconCrown size={20} />
              </Link>

              {/* Notifications */}
              <Link
                href="/notifications"
                onClick={() => setMobileOpen(false)}
                title="Push Notifications"
                aria-label="Push Notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/notifications')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconBell size={20} />
              </Link>

              {/* Section Divider */}
              <div className="w-8 h-px bg-border-subtle my-1 shrink-0" />

              {/* Theme Toggle (Night / Light) */}
              <button
                type="button"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Night'} Mode`}
                aria-label="Toggle theme"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                {theme === 'dark' ? (
                  <IconMoonSolid size={20} />
                ) : (
                  <IconSunSolid size={20} />
                )}
              </button>

              {/* Settings */}
              <Link
                href="/system/settings"
                onClick={() => setMobileOpen(false)}
                title="Global Settings"
                aria-label="Global Settings"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/system/settings')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconSettings size={20} />
              </Link>

              {/* System Health / Analytics */}
              <Link
                href="/system/health"
                onClick={() => setMobileOpen(false)}
                title="System Health & Rollover Overview"
                aria-label="System Health"
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 shrink-0 ${
                  isLinkActive('/system/health')
                    ? 'bg-surface-strong text-text-primary ring-1 ring-border-strong shadow-xs'
                    : 'bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                <IconChart size={20} />
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                <IconBook size={20} />
              </a>

              {/* Support */}
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                title="Contact Support"
                aria-label="Contact Support"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-all duration-150 shrink-0"
              >
                <IconChat size={20} />
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
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-strong/40 text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-colors"
              >
                <IconLogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: EXPANDED MODE (SOLID GAMING ICONS + LABELS)            */
          /* ============================================================== */
          <>
            {/* Workspace Brand Header */}
            <div className="flex h-14 shrink-0 items-center justify-between px-3.5 border-b border-border-subtle">
              <Link
                href="/"
                className="flex items-center gap-2.5 overflow-hidden group"
                onClick={() => setMobileOpen(false)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-text-primary font-black text-xs border border-border-default shadow-sm">
                  BA
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-text-primary text-sm tracking-tight truncate">
                    Bit Arcade
                  </span>
                  <span className="text-xs text-text-secondary truncate">
                    Admin Platform
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-colors"
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
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconDashboard size={20} className="shrink-0" />
                      <span className={isLinkActive('/') ? 'font-bold' : ''}>Dashboard</span>
                    </Link>

                    {/* Games Management - Tree Node with Sub-items */}
                    <div>
                      <div
                        className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-all ${
                          pathname.startsWith('/games')
                            ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                        }`}
                        onClick={() => setGamesTreeOpen(!gamesTreeOpen)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconGamepad size={20} className="shrink-0" />
                          <span className={pathname.startsWith('/games') ? 'font-bold' : ''}>Games</span>
                        </div>
                        <span className="text-text-secondary group-hover:text-text-primary transition-colors">
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
                            <span className="h-1.5 w-1.5 rounded-full bg-text-secondary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>All Games Overview</span>
                          </Link>
                          <Link
                            href="/games?game=ring_of_future"
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-text-secondary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>Ring of Future</span>
                          </Link>
                          <Link
                            href="/games?game=tictactoe"
                            onClick={() => setMobileOpen(false)}
                            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/50 transition-colors"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-text-secondary group-hover:bg-text-primary transition-colors shrink-0" />
                            <span>Tic-Tac-Toe</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Deposits / Wallet */}
                    <Link
                      href="/payments/deposits"
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/payments/deposits')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconWallet size={20} className="shrink-0" />
                        <span className={isLinkActive('/payments/deposits') ? 'font-bold' : ''}>Wallet Deposits</span>
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
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconWithdraw size={20} className="shrink-0" />
                        <span className={isLinkActive('/payments/withdrawals') ? 'font-bold' : ''}>Withdrawals</span>
                      </div>
                      {pendingCounts.pendingWithdrawals > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-surface-strong text-text-primary border border-border-default tabular-nums">
                          {pendingCounts.pendingWithdrawals}
                        </span>
                      )}
                    </Link>

                    {/* Transactions / Ledger */}
                    <Link
                      href="/transactions/ledger"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/transactions/ledger')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconTransactions size={20} className="shrink-0" />
                      <span className={isLinkActive('/transactions/ledger') ? 'font-bold' : ''}>Transactions Ledger</span>
                    </Link>

                    {/* Player Accounts */}
                    <Link
                      href="/users"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/users')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconPlayers size={20} className="shrink-0" />
                      <span className={isLinkActive('/users') ? 'font-bold' : ''}>Player Accounts</span>
                    </Link>

                    {/* Promotions & VIP Club */}
                    <Link
                      href="/promotions"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/promotions')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconCrown size={20} className="shrink-0" />
                        <span className={isLinkActive('/promotions') ? 'font-bold' : ''}>VIP & Promotions</span>
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
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconBell size={20} className="shrink-0" />
                      <span className={isLinkActive('/notifications') ? 'font-bold' : ''}>Notifications</span>
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
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium cursor-pointer transition-all text-text-secondary hover:text-text-primary hover:bg-surface-strong/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {theme === 'dark' ? (
                          <IconMoonSolid size={20} className="shrink-0" />
                        ) : (
                          <IconSunSolid size={20} className="shrink-0" />
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

                    {/* Global Settings */}
                    <Link
                      href="/system/settings"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/system/settings')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconSettings size={20} className="shrink-0" />
                      <span className={isLinkActive('/system/settings') ? 'font-bold' : ''}>Global Settings</span>
                    </Link>

                    {/* System Health / Analytics Overview */}
                    <Link
                      href="/system/health"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isLinkActive('/system/health')
                          ? 'bg-surface-strong text-text-primary ring-1 ring-border-default shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong/60'
                      }`}
                    >
                      <IconChart size={20} className="shrink-0" />
                      <span className={isLinkActive('/system/health') ? 'font-bold' : ''}>Rollover & System Health</span>
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
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/60 transition-all"
                    >
                      <IconBook size={20} className="shrink-0" />
                      <span>Documentation</span>
                    </a>

                    <a
                      href="https://t.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-strong/60 transition-all"
                    >
                      <IconChat size={20} className="shrink-0" />
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
                    <span className="text-xs text-text-secondary truncate">
                      Superadmin
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out of admin session"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-strong transition-colors shrink-0"
                >
                  <IconLogOut size={20} className="shrink-0" />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
