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
        window.location.href = '/';
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-base px-4 font-sans text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      <Card className="w-full max-w-[400px] space-y-6 p-8 border border-border-default bg-surface-raised rounded-xl shadow-lg">

        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary text-text-inverse font-black text-base shadow-xs mb-3.5">
            BA
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Bit Arcade</h1>
          <p className="text-sm text-text-secondary mt-1">Authoritative Admin Console Sign In</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" strokeWidth={1.8} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1.5 font-medium text-text-secondary">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" strokeWidth={1.8} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/70 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:bg-surface-raised focus:border-border-strong focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-text-tertiary" strokeWidth={1.8} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/70 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:bg-surface-raised focus:border-border-strong focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            isLoading={loading}
            className="w-full mt-3 rounded-lg font-semibold shadow-xs"
          >
            Sign In to Platform
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary pt-3 border-t border-border-subtle">
          <ShieldCheck className="h-4 w-4 text-emerald-500" strokeWidth={1.8} />
          <span>Encrypted cryptographic admin session</span>
        </div>

      </Card>
    </div>
  );
}
