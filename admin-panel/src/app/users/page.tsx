'use client';
import React, { useState, useEffect } from 'react';
import { Search, UserX, UserCheck, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { userService } from '@/services/userService';

interface UserData {
  id: string;
  phone: string;
  name: string;
  isBanned: boolean;
  createdAt: number;
  balance?: {
    depositPaise: number;
    winningPaise: number;
    bonusPaise: number;
    totalPaise: number;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch real users:', err);
      setError(err.message || 'Could not connect to live backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const res = await userService.toggleBan(userId, !currentBanStatus);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const name = u.name || '';
    const phone = u.phone || '';
    const id = u.id || '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || phone.includes(search) || id.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ACTIVE') return matchesSearch && !u.isBanned;
    if (filter === 'BANNED') return matchesSearch && u.isBanned;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">User Management</h1>
          <p className="text-xs text-zinc-400 mt-1">Live database synchronization with integer paise balance accounting</p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, ID..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-1.5 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-medium text-zinc-400">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded px-2.5 py-1 transition ${filter === 'ALL' ? 'text-white bg-zinc-800 font-semibold' : 'hover:text-white'}`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`rounded px-2.5 py-1 transition ${filter === 'ACTIVE' ? 'text-white bg-zinc-800 font-semibold' : 'hover:text-white'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('BANNED')}
              className={`rounded px-2.5 py-1 transition ${filter === 'BANNED' ? 'text-white bg-zinc-800 font-semibold' : 'hover:text-white'}`}
            >
              Banned
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Backend API Error: {error}</span>
          </div>
          <button onClick={fetchUsers} className="rounded bg-rose-500/20 px-2.5 py-1 font-semibold hover:bg-rose-500/30">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span>Fetching live user accounts from backend REST API...</span>
        </div>
      ) : (
        /* Users Table */
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Wallet Breakdown</th>
                <th className="px-4 py-3">Total Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-xs">
                    No active user accounts registered in database.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const depositPaise = u.balance?.depositPaise || 0;
                  const winningPaise = u.balance?.winningPaise || 0;
                  const totalPaise = u.balance?.totalPaise || 0;
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/60 transition">
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-zinc-200 border border-zinc-700">
                            {(u.name || 'P').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{u.name || 'Player'}</div>
                            <div className="text-[10px] text-zinc-500">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-300">
                        <div className="flex items-center gap-1">
                          <span>{u.id}</span>
                          <button onClick={() => copyToClipboard(u.id)} className="text-zinc-500 hover:text-zinc-300">
                            {copiedId === u.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-zinc-400">{u.phone}</td>

                      <td className="px-4 py-3">
                        <div className="text-[11px] space-y-0.5 font-mono">
                          <div className="text-zinc-400">Deposit: <span className="text-zinc-200">₹{(depositPaise / 100).toFixed(2)}</span></div>
                          <div className="text-zinc-400">Winnings: <span className="text-emerald-400">₹{(winningPaise / 100).toFixed(2)}</span></div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-sm text-white">
                        ₹{(totalPaise / 100).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> BANNED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleBan(u.id, u.isBanned)}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                            u.isBanned
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                          }`}
                        >
                          {u.isBanned ? (
                            <>
                              <UserCheck className="h-3 w-3" /> Unban
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3" /> Ban Account
                            </>
                          )}
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
