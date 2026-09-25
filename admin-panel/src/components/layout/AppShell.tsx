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
    <div className="min-h-screen bg-surface-base text-text-primary flex font-mono text-sm">
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
          collapsed ? 'md:pl-[88px]' : 'md:pl-[280px]'
        }`}
      >
        {/* Top Floating Utility Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-default bg-surface-base/90 backdrop-blur-md px-space-4 sm:px-space-6">
          <div className="flex items-center gap-space-3">
            {/* Mobile Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xs border border-border-default bg-surface-raised text-text-secondary md:hidden hover:text-text-primary transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Breadcrumb / Title Context */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-space-2 text-xs">
              <span className="text-text-tertiary">Platform</span>
              <span className="text-border-default" aria-hidden="true">/</span>
              <span className="font-medium text-text-primary">
                {pathname === '/' ? 'Overview Telemetry' : pathname.replace('/', '').replace('payments/', '')}
              </span>
            </nav>
          </div>

          {/* Quick Universal Search */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search user, ID..."
              aria-label="Search users and identifiers"
              className="w-full rounded-xs border border-border-default bg-surface-raised py-1.5 pl-8 pr-8 text-xs text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
            />
            <kbd className="absolute right-2 top-2 flex items-center gap-0.5 rounded-xs border border-border-default bg-surface-muted px-1 py-0.5 text-[9px] text-text-tertiary font-mono">
              <Command className="h-2.5 w-2.5" aria-hidden="true" /> K
            </kbd>
          </div>
        </header>

        {/* Viewport Main Children */}
        <main className="flex-1 p-space-4 sm:p-space-6 lg:p-space-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
