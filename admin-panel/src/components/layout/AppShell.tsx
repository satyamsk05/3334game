'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Search, Command, Menu, Bell, Home, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageInfo = (path: string) => {
    if (path === '/') return { section: 'Overview', title: 'Dashboard Telemetry' };
    if (path === '/users') return { section: 'Members', title: 'Player Accounts' };
    if (path === '/games') return { section: 'Operations', title: 'Game Engine' };
    if (path === '/payments/deposits') return { section: 'Financial', title: 'Deposit Approvals' };
    if (path === '/payments/withdrawals') return { section: 'Financial', title: 'Withdrawal Requests' };
    if (path === '/transactions/ledger') return { section: 'Financial', title: 'Authoritative Ledger' };
    if (path === '/notifications') return { section: 'Growth', title: 'Push Notifications' };
    if (path === '/promotions') return { section: 'Growth', title: 'Promotions & Banners' };
    if (path === '/system/settings') return { section: 'Configuration', title: 'Platform Settings' };
    if (path === '/system/health') return { section: 'Diagnostics', title: 'System Health' };
    return { section: 'Platform', title: path.replace('/', '') };
  };

  const pageInfo = getPageInfo(pathname);

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex font-sans antialiased selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent-primary focus:text-text-inverse focus:font-medium focus:text-sm focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Adaptive Tree Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          collapsed ? 'md:pl-[68px]' : 'md:pl-64'
        }`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-8 bg-surface-raised/80 backdrop-blur-md border-b border-border-default transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-surface-strong text-text-secondary md:hidden hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Breadcrumb Context */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors"
                title="Go to Dashboard"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </Link>
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
              <span className="text-text-tertiary font-normal hidden sm:inline">
                {pageInfo.section}
              </span>
              <span className="text-text-tertiary hidden sm:inline">/</span>
              <span className="text-text-primary font-semibold truncate max-w-[150px] sm:max-w-none">
                {pageInfo.title}
              </span>
            </nav>
          </div>

          {/* Right Header Controls: Universal Search Pill, Notifications, Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Universal Search Pill Input */}
            <div className="relative w-44 sm:w-64">
              <Search
                className="absolute left-3 top-3 h-4 w-4 text-text-tertiary pointer-events-none"
                aria-hidden="true"
                strokeWidth={1.8}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search users, UTR, ID..."
                aria-label="Search users and identifiers"
                className="w-full h-10 rounded-lg border border-border-default bg-surface-strong pl-9 pr-14 text-sm font-normal text-text-primary placeholder:text-text-tertiary focus:bg-surface-strong focus:border-border-strong focus:outline-none transition-all shadow-xs"
              />
              <kbd className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-surface-base border border-border-default px-1.5 py-0.5 text-xs text-text-tertiary font-mono pointer-events-none">
                <Command className="h-3 w-3" aria-hidden="true" strokeWidth={1.8} /> K
              </kbd>
            </div>

            {/* Notification Bell */}
            <Link
              href="/payments/deposits"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-surface-strong text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors focus-visible:ring-2 focus-visible:ring-border-focus"
              title="Deposit & Payment Alerts"
              aria-label="Deposit and payment alerts"
            >
              <Bell className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-surface-raised" />
            </Link>

            {/* Live Web App Shortcut */}
            <a
              href="https://bitarcade-pay.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-2 h-10 px-3.5 rounded-lg border border-border-default bg-surface-strong text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-border-focus"
              title="Open Payment Gateway"
            >
              <span>Gateway</span>
              <ExternalLink className="h-4 w-4 text-text-tertiary" />
            </a>
          </div>
        </header>

        {/* Viewport Content Container */}
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto space-y-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
