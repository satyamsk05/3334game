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
          className="fixed inset-0 z-40 bg-surface-base/80 backdrop-blur-sm md:hidden transition-fast"
          aria-hidden="true"
        />
      )}

      {/* Main Studio Sidebar */}
      <aside
        aria-label="Admin Navigation Sidebar"
        className={`fixed top-space-3 bottom-space-3 z-50 flex flex-col rounded-lg border border-border-default bg-surface-raised shadow-2xl transition-normal ${
          collapsed ? 'w-[68px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'left-space-3' : '-left-[300px] md:left-space-3'
        }`}
      >
        <div className="flex h-full flex-col p-space-3 overflow-hidden">
          
          {/* Brand & Collapse Header */}
          <div className="flex items-center justify-between pb-space-3 pt-space-1 px-space-1">
            <div className={`flex items-center gap-space-2.5 overflow-hidden transition-normal ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xs bg-accent-primary text-text-inverse font-black text-xs shadow-sm font-mono">
                334
              </div>
              <div className="flex flex-col whitespace-nowrap">
                <span className="font-semibold text-text-primary text-sm tracking-tight">Studio Admin</span>
                <span className="text-xs text-text-tertiary font-mono">v1.2 • PostgreSQL Hub</span>
              </div>
            </div>

            {/* Collapsed Mode Logo */}
            {collapsed && (
              <div className="mx-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-xs bg-accent-primary text-text-inverse font-black text-xs shadow-sm font-mono">
                334
              </div>
            )}

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed((prev: boolean) => !prev)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className={`flex h-7 w-7 items-center justify-center rounded-xs border border-border-default bg-surface-muted text-text-secondary hover:text-text-primary hover:border-border-default/80 transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                collapsed ? 'mt-space-2 mx-auto' : ''
              }`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Divider */}
          <hr className="border-t border-border-muted my-space-1" />

          {/* Profile Section */}
          <div className={`my-space-1.5 flex items-center gap-space-2.5 rounded-sm bg-surface-muted border border-border-muted p-space-1.5 transition-fast ${
            collapsed ? 'justify-center p-space-1 border-none bg-transparent' : ''
          }`}>
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xs bg-border-default border border-border-muted text-xs font-semibold text-text-primary font-mono">
              {adminName.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-status-positive border border-surface-raised" aria-hidden="true" />
            </div>

            <div className={`flex flex-col overflow-hidden transition-normal ${collapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              <span className="truncate text-xs font-medium text-text-primary">{adminName}</span>
              <span className="text-xs text-text-tertiary font-mono">Platform Admin</span>
            </div>
          </div>

          {/* Navigation Items with Groups & Sub-items */}
          <div className="mt-space-1 flex-1 overflow-y-auto pr-space-1 space-y-space-3">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-space-1">
                {!collapsed && (
                  <div className="px-space-2 pt-space-1 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
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
                              className={`group relative flex flex-1 items-center gap-space-2.5 rounded-sm px-space-2.5 py-space-1.5 text-xs font-medium transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                                isActive
                                  ? 'bg-accent-primary/15 text-text-primary border border-accent-primary/30 shadow-sm'
                                  : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                              } ${collapsed ? 'justify-center px-0 py-space-2' : ''}`}
                            >
                              {isActive && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-accent-primary" aria-hidden="true" />
                              )}

                              <Icon
                                className={`h-4 w-4 shrink-0 transition-fast ${
                                  isActive ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'
                                }`}
                                aria-hidden="true"
                              />

                              <span
                                className={`truncate transition-normal ${
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
                                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.name} submenu`}
                                className="p-space-1.5 text-text-secondary hover:text-text-primary transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Submenu items */}
                          {!collapsed && hasSubItems && isExpanded && (
                            <ul className="ml-space-6 pl-space-2 border-l border-border-default mt-0.5 space-y-0.5">
                              {item.subItems!.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <li key={sub.name}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => setMobileOpen(false)}
                                      className={`block rounded-xs px-space-2 py-space-1 text-xs transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                                        isSubActive
                                          ? 'text-accent-primary font-semibold bg-accent-primary/10'
                                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
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
          <div className="pt-space-2 border-t border-border-muted space-y-space-1.5">
            <div
              className={`flex items-center gap-space-2 rounded-xs bg-surface-muted border border-border-muted p-space-1.5 text-xs text-text-secondary ${
                collapsed ? 'justify-center p-space-1' : ''
              }`}
              title="Authoritative Ops Node"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-positive animate-pulse" aria-hidden="true" />
              <span className={`truncate text-xs font-mono ${collapsed ? 'hidden' : 'inline'}`}>
                PostgreSQL Direct
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
              aria-label="Logout of administration portal"
              className={`flex w-full items-center gap-space-2.5 rounded-xs border border-border-default bg-surface-muted px-space-2.5 py-space-1.5 text-xs font-medium text-text-secondary hover:border-status-negative/30 hover:bg-status-negative/10 hover:text-status-negative transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'inline'}`}>Logout</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
