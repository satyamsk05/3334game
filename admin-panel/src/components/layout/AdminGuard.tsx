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
      <div className="flex h-screen w-full items-center justify-center bg-black text-[12px] text-[#8c8c8c]">
        <div className="flex items-center gap-2 rounded-[4px] border border-white/[0.08] bg-[#212123] px-3.5 py-2 shadow-sm">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2988ff]" />
          <span>Verifying Studio Authorization...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
