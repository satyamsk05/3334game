'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Search, 
  Bell,
  Command,
  LogOut
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navItems = [
    { name: 'Overview', href: '/', icon: BarChart3 },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Deposits', href: '/payments/deposits', icon: ArrowDownLeft, badge: '2 Pending' },
    { name: 'Withdrawals', href: '/payments/withdrawals', icon: ArrowUpRight, badge: '1 Pending' },
    { name: 'Reports', href: '/reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      {/* Top Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Workspace Switcher */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950 font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                334
              </div>
              <span className="font-semibold text-white tracking-tight text-sm sm:text-base">
                3334 Game Admin
              </span>
            </Link>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* Production Badge */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Production
            </div>
          </div>

          {/* Search Bar & Logout Button */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search user, UTR, UPI..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-1.5 pl-9 pr-8 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition"
              />
              <kbd className="absolute right-2.5 top-2 flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono">
                <Command className="h-2.5 w-2.5" /> K
              </kbd>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>

        </div>

        {/* Minimalist Dub.co Navigation Tabs */}
        <nav className="-mb-px flex space-x-1 overflow-x-auto scrollbar-none py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white bg-zinc-900 border border-zinc-800 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                <span>{item.name}</span>

                {item.badge && (
                  <span className="ml-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
