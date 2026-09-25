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
    <div className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 font-sans text-gray-900">
      <Card className="w-full max-w-sm space-y-6 p-8 shadow-card border border-gray-100">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md relative overflow-hidden">
            <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
              <div className="bg-white/90 rounded-tl-sm" />
              <div className="bg-white/40 rounded-tr-sm" />
              <div className="bg-white/40 rounded-bl-sm" />
              <div className="bg-white/90 rounded-br-sm" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">334 Studio Admin</h1>
            <p className="text-xs font-medium text-gray-500 mt-0.5">Authoritative Management Console</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Staff Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-fast"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-semibold text-gray-700">Staff Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-fast"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="dark"
            size="lg"
            disabled={loading}
            isLoading={loading}
            className="w-full mt-2"
          >
            Sign in to Console
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Encrypted 256-bit Session</span>
        </div>

      </Card>
    </div>
  );
}
