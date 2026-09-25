'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Gamepad2,
  ArrowLeftRight,
  BarChart3,
  FileSpreadsheet,
  LifeBuoy,
  Server,
  ShieldCheck,
  PanelLeft,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  subItems?: Array<{ name: string; href: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Users: true,
    Games: true,
    Transactions: true,
    System: false,
    Security: false
  });

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

  const toggleSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const navSections: NavSection[] = [
    {
      title: 'Platform',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutGrid },
      ]
    },
    {
      title: 'Operations',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: Users,
          subItems: [
            { name: 'All Users', href: '/users' },
            { name: 'Active Players', href: '/users?status=active' },
            { name: 'Suspended / Banned', href: '/users?status=banned' }
          ]
        },
        {
          name: 'Games',
          href: '/games',
          icon: Gamepad2,
          subItems: [
            { name: 'Catalog & Config', href: '/games' },
            { name: 'Live Operations', href: '/games?filter=live' }
          ]
        },
        {
          name: 'Transactions',
          href: '/transactions/ledger',
          icon: ArrowLeftRight,
          subItems: [
            { name: 'Wallet Ledger', href: '/transactions/ledger' },
            { name: 'Deposits Queue', href: '/payments/deposits' },
            { name: 'Withdrawals Queue', href: '/payments/withdrawals' }
          ]
        }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
        { name: 'Support', href: '/support', icon: LifeBuoy }
      ]
    },
    {
      title: 'System & Security',
      items: [
        {
          name: 'System',
          href: '/system/health',
          icon: Server,
          subItems: [
            { name: 'Node Health', href: '/system/health' },
            { name: 'Platform Settings', href: '/system/settings' },
            { name: 'Announcements', href: '/system/announcements' }
          ]
        },
        {
          name: 'Security',
          href: '/security/admins',
          icon: ShieldCheck,
          subItems: [
            { name: 'Admin Staff', href: '/security/admins' },
            { name: 'Roles & RBAC', href: '/security/roles' },
            { name: 'Audit Logs', href: '/security/audit-logs' }
          ]
        }
      ]
    }
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
          <div className="flex items-center justify-between pb-3 pt-1 px-1">
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-[#2988ff] text-white font-black text-xs shadow-sm">
                334
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-semibold text-[#e1e1e1] text-[13px] tracking-tight">Studio Admin</span>
                <span className="text-[10px] text-[#8c8c8c] font-mono">v1.2 • PostgreSQL Hub</span>
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
          <div className={`my-1.5 flex items-center gap-2.5 rounded-[6px] bg-white/[0.02] border border-white/[0.04] p-1.5 transition-all ${
            collapsed ? 'justify-center p-1 border-none bg-transparent' : ''
          }`}>
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-[#e1e1e1]">
              {adminName.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[#212123]" />
            </div>

            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <span className="truncate text-[12px] font-medium text-[#e1e1e1]">{adminName}</span>
              <span className="text-[10px] text-[#8c8c8c] font-mono">Platform Admin</span>
            </div>
          </div>

          {/* Navigation Items with Groups & Sub-items */}
          <div className="mt-1 flex-1 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10 space-y-3">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <div className="px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#666666]">
                    {section.title}
                  </div>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isDirectActive = pathname === item.href;
                    const isParentOfActive = item.subItems?.some((sub) => {
                      if (sub.href.includes('?')) {
                        return pathname === sub.href.split('?')[0];
                      }
                      return pathname === sub.href;
                    });
                    const isActive = isDirectActive || (isParentOfActive && pathname !== '/');
                    const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
                    const isExpanded = expandedMenus[item.name];

                    return (
                      <li key={item.name}>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Link
                              href={item.href}
                              onClick={() => {
                                if (!hasSubItems) setMobileOpen(false);
                              }}
                              title={collapsed ? item.name : undefined}
                              className={`group relative flex flex-1 items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                                isActive
                                  ? 'bg-[#2988ff]/15 text-[#e1e1e1] border border-[#2988ff]/30 shadow-sm'
                                  : 'text-[#a6a6a6] hover:bg-white/[0.04] hover:text-[#e1e1e1]'
                              } ${collapsed ? 'justify-center px-0 py-2' : ''}`}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#2988ff]" />
                              )}

                              <Icon
                                className={`h-4 w-4 shrink-0 transition-colors ${
                                  isActive ? 'text-[#2988ff]' : 'text-[#8c8c8c] group-hover:text-[#e1e1e1]'
                                }`}
                              />

                              <span
                                className={`truncate transition-all duration-200 ${
                                  collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'
                                }`}
                              >
                                {item.name}
                              </span>
                            </Link>

                            {!collapsed && hasSubItems && (
                              <button
                                type="button"
                                onClick={(e) => toggleSubmenu(item.name, e)}
                                className="p-1.5 text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Submenu items */}
                          {!collapsed && hasSubItems && isExpanded && (
                            <ul className="ml-6 pl-2 border-l border-white/[0.08] mt-0.5 space-y-0.5">
                              {item.subItems!.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={`block rounded-[4px] px-2 py-1 text-[11px] transition-colors ${
                                        isSubActive
                                          ? 'text-[#2988ff] font-semibold bg-[#2988ff]/10'
                                          : 'text-[#8c8c8c] hover:text-[#e1e1e1] hover:bg-white/[0.02]'
                                      }`}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Actions & System Status */}
          <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
            <div
              className={`flex items-center gap-2 rounded-[4px] bg-white/[0.02] border border-white/[0.04] p-1.5 text-[11px] text-[#8c8c8c] ${
                collapsed ? 'justify-center p-1' : ''
              }`}
              title="Authoritative Ops Node"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
              <span className={`truncate text-[10.5px] font-mono ${collapsed ? 'hidden' : 'inline'}`}>
                PostgreSQL Direct
              </span>
            </div>

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
