'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-zinc-950 font-black text-xl shadow-md">
            334
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Admin Authentication</h1>
          <p className="text-xs text-zinc-400">Restricted Portal — Authorized Access Only</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1.5 font-medium text-zinc-300">Admin Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-medium text-zinc-300">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-3 text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-500 focus:outline-none transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In to Admin Portal'
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted 256-bit Admin Session</span>
        </div>

      </div>
    </div>
  );
}
