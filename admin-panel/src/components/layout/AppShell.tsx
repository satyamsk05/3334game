'use client';
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Search, Command, Menu } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Overview Telemetry';
    if (path === '/users') return 'Player Accounts';
    if (path === '/games') return 'Game Engine Operations';
    if (path === '/payments/deposits') return 'Deposit Approvals';
    if (path === '/payments/withdrawals') return 'Withdrawal Requests';
    if (path === '/transactions/ledger') return 'Authoritative Ledger';
    if (path === '/notifications') return 'Push Notifications';
    if (path === '/promotions') return 'Promotions & Banners';
    if (path === '/system/settings') return 'Platform Settings';
    if (path === '/system/health') return 'System Diagnostics';
    return path.replace('/', '').replace('payments/', '').replace('system/', '');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#fcfcfc] flex font-sans antialiased selection:bg-white/20 selection:text-white">
      {/* Studio Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          collapsed ? 'md:pl-[68px]' : 'md:pl-60'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 sm:px-8 bg-[#000000]/80 backdrop-blur-md border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-zinc-900 text-zinc-400 md:hidden hover:text-white transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Breadcrumb Context */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium">Platform</span>
              <span className="text-zinc-700" aria-hidden="true">/</span>
              <span className="text-zinc-200 font-semibold capitalize">
                {getPageTitle(pathname)}
              </span>
            </nav>
          </div>

          {/* Quick Universal Search with Pill Input */}
          <div className="relative w-44 sm:w-60">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" aria-hidden="true" strokeWidth={1.75} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search users, IDs..."
              aria-label="Search users and identifiers"
              className="w-full rounded-md border border-white/[0.08] bg-[#0c0c0e] py-1.5 pl-8 pr-8 text-base sm:text-xs font-normal text-white placeholder:text-zinc-500 focus:bg-[#141417] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
            />
            <kbd className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded bg-zinc-800/80 border border-white/[0.08] px-1 py-0.5 text-[9px] text-zinc-400 font-mono">
              <Command className="h-2.5 w-2.5" aria-hidden="true" strokeWidth={1.75} /> K
            </kbd>
          </div>
        </header>

        {/* Viewport Main Children */}
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
