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
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearch(q);
    }
  }, []);

  const toggleBan = async (userId: string, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'UNBAN' : 'BAN';
    if (!window.confirm(`Are you sure you want to ${action} user account ${userId}?`)) {
      return;
    }
    try {
      setProcessingId(userId);
      const res = await userService.toggleBan(userId, !currentBanStatus);
      if (res.success) {
        await fetchUsers();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setProcessingId(null);
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
      
      {/* Studio Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Player Directory</h1>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative accounts with integer paise wallet accounting</p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#8c8c8c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, phone, ID..."
              className="w-full rounded-[4px] border border-white/[0.08] bg-white/[0.04] py-1 pl-8 pr-3 text-[12px] text-[#e1e1e1] placeholder-[#8c8c8c] focus:border-[#2988ff] focus:outline-none focus:ring-1 focus:ring-[#2988ff] transition-all"
            />
          </div>

          <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
            <button
              onClick={() => setFilter('ALL')}
              className={`rounded-[3px] px-2 py-0.5 transition-colors ${filter === 'ALL' ? 'text-[#e1e1e1] bg-white/[0.08] font-medium' : 'hover:text-[#e1e1e1]'}`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`rounded-[3px] px-2 py-0.5 transition-colors ${filter === 'ACTIVE' ? 'text-[#e1e1e1] bg-white/[0.08] font-medium' : 'hover:text-[#e1e1e1]'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('BANNED')}
              className={`rounded-[3px] px-2 py-0.5 transition-colors ${filter === 'BANNED' ? 'text-[#e1e1e1] bg-white/[0.08] font-medium' : 'hover:text-[#e1e1e1]'}`}
            >
              Banned
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-[4px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Backend Server Communication Error: {error}</span>
          </div>
          <button onClick={fetchUsers} className="rounded-[3px] bg-red-500/20 px-2 py-0.5 font-medium hover:bg-red-500/30">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-[12px] text-[#8c8c8c] flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#2988ff]" />
          <span>Synchronizing live player accounts...</span>
        </div>
      ) : (
        /* Users Table */
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Player</th>
                <th className="px-4 py-2.5">User ID</th>
                <th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Wallet Breakdown</th>
                <th className="px-4 py-2.5">Total Balance</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[12px]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#8c8c8c] text-[12px]">
                    No player accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const depositPaise = u.balance?.depositPaise || 0;
                  const winningPaise = u.balance?.winningPaise || 0;
                  const totalPaise = u.balance?.totalPaise || 0;
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-[3px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-medium text-[11px] text-[#e1e1e1]">
                            {(u.name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-[#e1e1e1] text-[12.5px]">{u.name || 'Player'}</div>
                            <div className="text-[10px] text-[#8c8c8c] font-mono">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#e1e1e1]">
                        <div className="flex items-center gap-1">
                          <span className="truncate max-w-[120px]">{u.id}</span>
                          <button 
                            onClick={() => copyToClipboard(u.id)} 
                            className="text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === u.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#a6a6a6]">{u.phone}</td>

                      <td className="px-4 py-2.5">
                        <div className="text-[11px] space-y-0.5 font-mono">
                          <div className="text-[#8c8c8c]">Dep: <span className="text-[#e1e1e1]">₹{(depositPaise / 100).toFixed(2)}</span></div>
                          <div className="text-[#8c8c8c]">Win: <span className="text-emerald-400">₹{(winningPaise / 100).toFixed(2)}</span></div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-mono font-semibold text-[13px] text-[#e1e1e1]">
                        ₹{(totalPaise / 100).toFixed(2)}
                      </td>

                      <td className="px-4 py-2.5">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 rounded-[3px] border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-red-400">
                            <span className="h-1 w-1 rounded-full bg-red-400" /> BANNED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-[3px] border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                            <span className="h-1 w-1 rounded-full bg-emerald-400" /> ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 text-right">
                        <button
                          disabled={processingId === u.id}
                          onClick={() => toggleBan(u.id, u.isBanned)}
                          className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-1 text-[11px] font-medium transition-all disabled:opacity-50 ${
                            u.isBanned
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-white/[0.08] bg-white/[0.03] text-[#a6a6a6] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400'
                          }`}
                        >
                          {processingId === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : u.isBanned ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                          <span>{u.isBanned ? 'Unban' : 'Ban Account'}</span>
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
