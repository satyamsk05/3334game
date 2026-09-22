'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  PanelLeft,
  LogOut,
  ShieldCheck,
  Search,
  Command,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminUser');
      if (stored) setAdminName(stored);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutGrid },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft },
    { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Main Studio Sidebar */}
      <aside
        className={`fixed top-3 bottom-3 z-50 flex flex-col rounded-[12px] border border-white/[0.08] bg-[#212123] shadow-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[68px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'left-3' : '-left-[300px] md:left-3'
        }`}
      >
        <div className="flex h-full flex-col p-3 overflow-hidden">
          
          {/* Brand & Collapse Header */}
          <div className="flex items-center justify-between pb-3.5 pt-1 px-1">
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#2988ff] text-white font-black text-xs shadow-sm">
                334
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-semibold text-[#e1e1e1] text-[13px] tracking-tight">Studio Admin</span>
                <span className="text-[10px] text-[#8c8c8c] font-mono">v1.0 • Live Node</span>
              </div>
            </div>

            {/* In collapsed mode, show small logo when brand text is hidden */}
            {collapsed && (
              <div className="mx-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#2988ff] text-white font-black text-xs shadow-sm">
                334
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed((prev: boolean) => !prev)}
              aria-label="Toggle sidebar"
              className={`flex h-7 w-7 items-center justify-center rounded-[4px] border border-white/[0.08] bg-white/[0.04] text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all ${
                collapsed ? 'mt-2 mx-auto' : ''
              }`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Divider */}
          <hr className="border-t border-white/[0.06] my-1" />

          {/* Profile Section */}
          <div className={`my-2 flex items-center gap-2.5 rounded-[6px] bg-white/[0.02] border border-white/[0.04] p-1.5 transition-all ${
            collapsed ? 'justify-center p-1 border-none bg-transparent' : ''
          }`}>
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-[#e1e1e1]">
              {adminName.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#212123]" />
            </div>

            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <span className="truncate text-[12px] font-medium text-[#e1e1e1]">{adminName}</span>
              <span className="text-[10px] text-[#8c8c8c] font-mono">Platform Admin</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="mt-2 flex-1 overflow-y-auto scrollbar-none space-y-1">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={`group relative flex items-center gap-3 rounded-[6px] px-2.5 py-2 text-[12px] font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#2988ff]/15 text-[#e1e1e1] border border-[#2988ff]/30 shadow-sm'
                          : 'text-[#a6a6a6] hover:bg-white/[0.04] hover:text-[#e1e1e1]'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#2988ff]" />
                      )}

                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#2988ff]' : 'text-[#8c8c8c] group-hover:text-[#e1e1e1]'
                        }`}
                      />

                      <span
                        className={`whitespace-nowrap transition-all duration-200 ${
                          collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                        }`}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Bottom Actions & System Status */}
          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            
            {/* Live Authoritative Badge */}
            <div
              className={`flex items-center gap-2 rounded-[4px] bg-white/[0.02] border border-white/[0.04] p-1.5 text-[11px] text-[#8c8c8c] ${
                collapsed ? 'justify-center p-1' : ''
              }`}
              title="Authoritative Ops Node"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`truncate text-[10.5px] font-mono ${collapsed ? 'hidden' : 'inline'}`}>
                Authoritative Node
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              className={`flex w-full items-center gap-2.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] font-medium text-[#a6a6a6] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'inline'}`}>Logout</span>
            </button>

          </div>

        </div>
      </aside>
    </>
  );
}
