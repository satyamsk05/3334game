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

  return (
    <div className="min-h-screen bg-surface-base text-text-primary flex font-sans antialiased">
      {/* Studio Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-normal ${
          collapsed ? 'md:pl-[96px]' : 'md:pl-[284px]'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-4 sm:px-8 bg-surface-base/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 md:hidden hover:text-gray-900 transition-fast"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Breadcrumb Context */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400">Platform</span>
              <span className="text-gray-300" aria-hidden="true">/</span>
              <span className="text-gray-800">
                {pathname === '/' ? 'Overview Telemetry' : pathname.replace('/', '').replace('payments/', '')}
              </span>
            </nav>
          </div>

          {/* Quick Universal Search with Pill Input */}
          <div className="relative w-52 sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search user, ID..."
              aria-label="Search users and identifiers"
              className="w-full rounded-full border border-gray-200/80 bg-white py-2 pl-10 pr-9 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 shadow-sm transition-fast"
            />
            <kbd className="absolute right-3 top-2.5 flex items-center gap-0.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 font-mono">
              <Command className="h-3 w-3" aria-hidden="true" /> K
            </kbd>
          </div>
        </header>

        {/* Viewport Main Children */}
        <main className="flex-1 px-4 sm:px-8 py-4 sm:py-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
