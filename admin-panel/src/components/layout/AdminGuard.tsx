'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/Button';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifySession = useCallback(async () => {
    if (pathname === '/login') {
      setAuthorized(true);
      setVerifying(false);
      setErrorMsg(null);
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

    setVerifying(true);
    setErrorMsg(null);

    try {
      const res = await api.get('/admin/me', { timeout: 8000 });
      if (res.data?.success && res.data?.data) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        } else {
          router.replace('/login');
        }
      }
    } catch (err: any) {
      const status = err?.status ?? err?.original?.response?.status;
      const isUnauthorized = status === 401 || status === 403 || err?.isUnauthorized || err?.isForbidden;

      setAuthorized(false);
      if (isUnauthorized) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        } else {
          router.replace('/login');
        }
      } else {
        // Network or server communication error
        setErrorMsg(err?.message || 'Unable to connect to backend server. Please verify your connection.');
      }
    } finally {
      setVerifying(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  if (pathname === '/login') {
    return <>{children}</>;
  }

  if (verifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-base text-sm text-text-tertiary">
        <div className="flex items-center gap-2.5 rounded-lg border border-border-default bg-surface-raised px-4 py-3 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-accent-primary" />
          <span>Verifying Studio Authorization...</span>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-base px-4 font-sans text-sm text-text-primary">
        <div className="w-full max-w-sm rounded-xl border border-border-default bg-surface-raised p-6 shadow-lg text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Authorization Notice</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {errorMsg || 'Session verification could not be completed.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => verifySession()}
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Retry
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.replace('/login');
              }}
              icon={<LogIn className="h-4 w-4" />}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
