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
    <div className="min-h-screen bg-black text-[#e1e1e1] flex">
      {/* Studio Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'md:pl-[88px]' : 'md:pl-[280px]'
        }`}
      >
        {/* Top Floating Utility Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.08] bg-black/85 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.04] text-[#a6a6a6] md:hidden hover:text-[#e1e1e1]"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb / Title Context */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8c8c8c]">Platform</span>
              <span className="text-[#8c8c8c]">/</span>
              <span className="font-medium text-[#e1e1e1]">
                {pathname === '/' ? 'Overview Telemetry' : pathname.replace('/', '').replace('payments/', '')}
              </span>
            </div>
          </div>

          {/* Quick Universal Search */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#8c8c8c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search user, ID..."
              className="w-full rounded-[4px] border border-white/[0.08] bg-white/[0.04] py-1 pl-8 pr-8 text-[12px] text-[#e1e1e1] placeholder-[#8c8c8c] focus:border-[#2988ff] focus:outline-none focus:ring-1 focus:ring-[#2988ff] transition-all"
            />
            <kbd className="absolute right-2 top-1.5 flex items-center gap-0.5 rounded-[3px] border border-white/[0.08] bg-[#212123] px-1 py-0.5 text-[9px] text-[#8c8c8c] font-mono">
              <Command className="h-2 w-2" /> K
            </kbd>
          </div>
        </header>

        {/* Viewport Main Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
