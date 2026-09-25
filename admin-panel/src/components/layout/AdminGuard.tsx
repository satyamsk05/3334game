'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (pathname === '/login') {
      setAuthorized(true);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setAuthorized(false);
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  if (!authorized && pathname !== '/login') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-base text-xs text-text-tertiary">
        <div className="flex items-center gap-2 rounded-md border border-border-default bg-surface-raised px-4 py-2.5 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
          <span>Verifying Studio Authorization...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
