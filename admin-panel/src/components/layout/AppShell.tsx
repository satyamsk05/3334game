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
    <div className="min-h-screen bg-[#f9fafb] text-gray-900 flex font-sans antialiased">
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
          collapsed ? 'md:pl-[72px]' : 'md:pl-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-8 bg-white/90 backdrop-blur-md border-b border-gray-200/80">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 md:hidden hover:text-gray-900 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Breadcrumb Context */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400">Admin</span>
              <span className="text-gray-300" aria-hidden="true">/</span>
              <span className="text-gray-900 font-bold capitalize">
                {getPageTitle(pathname)}
              </span>
            </nav>
          </div>

          {/* Quick Universal Search with Pill Input */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search user, ID..."
              aria-label="Search users and identifiers"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-1.5 pl-9 pr-8 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-colors"
            />
            <kbd className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded bg-white border border-gray-200 px-1 py-0.5 text-[9px] text-gray-400 font-mono shadow-2xs">
              <Command className="h-2.5 w-2.5" aria-hidden="true" /> K
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
