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
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-[#e1e1e1]">
      <div className="w-full max-w-sm space-y-6 rounded-[8px] border border-white/[0.08] bg-[#212123] p-7 shadow-2xl">
        
        {/* Studio Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#2988ff] text-white font-black text-sm shadow-md">
            334
          </div>
          <h1 className="text-base font-semibold tracking-tight text-[#e1e1e1]">Studio Authentication</h1>
          <p className="text-[12px] text-[#a6a6a6]">Protected Portal — Authorized Operations Only</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-[4px] border border-red-500/20 bg-red-500/10 p-2.5 text-[12px] text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-[12px]">
          <div>
            <label className="block mb-1.5 font-medium text-[#a6a6a6]">Admin Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8c8c8c]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full rounded-[4px] border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-[#e1e1e1] placeholder-[#8c8c8c] focus:border-[#2988ff] focus:outline-none focus:ring-1 focus:ring-[#2988ff] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-medium text-[#a6a6a6]">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8c8c8c]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-[4px] border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-[#e1e1e1] placeholder-[#8c8c8c] focus:border-[#2988ff] focus:outline-none focus:ring-1 focus:ring-[#2988ff] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[4px] bg-[#2988ff] py-2 font-medium text-white hover:bg-[#1f73dc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2988ff] focus-visible:ring-offset-1 focus-visible:ring-offset-black transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 text-[12.5px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In to Admin Portal'
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8c8c8c] pt-2 border-t border-white/[0.06]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#2988ff]" />
          <span>Encrypted 256-bit Admin Session</span>
        </div>

      </div>
    </div>
  );
}
