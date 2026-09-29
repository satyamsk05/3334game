'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/admin/login', { username, password });
      if (res.data?.success && res.data?.data?.token) {
        localStorage.setItem('adminToken', res.data.data.token);
        localStorage.setItem('adminUser', res.data.data.username);
        router.push('/');
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#000000] px-4 font-sans text-white selection:bg-white/20 selection:text-white">
      <Card className="w-full max-w-[380px] space-y-6 p-7 border border-white/[0.08] bg-[#0c0c0e]">

        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-black text-xs shadow-sm mb-3">
            334
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white text-balance">334 Admin</h1>
          <p className="text-xs text-zinc-400 mt-1 text-pretty">Sign in to manage platform operations</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-rose-500/25 bg-rose-950/20 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1.5 font-medium text-zinc-300">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full rounded-md border border-white/[0.08] bg-[#141417] py-2 pl-9 pr-3 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:bg-[#18181b] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-medium text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" strokeWidth={1.75} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-white/[0.08] bg-[#141417] py-2 pl-9 pr-3 text-base sm:text-xs text-white placeholder:text-zinc-500 focus:bg-[#18181b] focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            isLoading={loading}
            className="w-full mt-2"
          >
            Sign in to Console
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-3 border-t border-white/[0.06]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.75} />
          <span>Encrypted 256-bit Session</span>
        </div>

      </Card>
    </div>
  );
}
