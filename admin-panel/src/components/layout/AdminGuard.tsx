'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/services/api';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (pathname === '/login') {
      setAuthorized(true);
      setVerifying(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token) {
      setAuthorized(false);
      setVerifying(false);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
      return;
    }

    let isMounted = true;
    const verifySession = async () => {
      try {
        const res = await api.get('/admin/me', { timeout: 5000 });
        if (isMounted) {
          if (res.data?.success && res.data?.data) {
            setAuthorized(true);
          } else {
            setAuthorized(false);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            router.replace('/login');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setAuthorized(false);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if ((verifying || !authorized) && pathname !== '/login') {
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
