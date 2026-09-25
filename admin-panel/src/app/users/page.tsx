'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { adminService, UserSummary } from '@/services/adminService';

export default function UsersManagementPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>(initialStatus.toUpperCase());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus) {
      setStatus(qStatus.toUpperCase());
    }
  }, [searchParams]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        status: status === 'ALL' ? undefined : status.toLowerCase()
      });
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      } else {
        setUsers([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to fetch real users:', err);
      setError(err.response?.data?.message || err.message || 'Could not connect to live backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const toggleBan = async (user: UserSummary) => {
    const currentBan = user.is_blocked;
    const action = currentBan ? 'UNBAN' : 'BAN';
    let reason = '';
    if (!currentBan) {
      const input = window.prompt(`Enter reason for banning user ${user.name || user.id}:`, 'Terms of service violation');
      if (input === null) return;
      reason = input.trim();
    } else {
      if (!window.confirm(`Are you sure you want to unban user ${user.name || user.id}?`)) {
        return;
      }
    }

    try {
      setProcessingId(user.id);
      const res = await adminService.toggleBan(user.id, !currentBan, reason);
      if (res.success) {
        await fetchUsers();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err: any) {
      alert(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      
      {/* Studio Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Player Directory</h1>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative accounts with integer paise wallet accounting ({total} total)</p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
            {['ALL', 'ACTIVE', 'BANNED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                className={`rounded-[3px] px-2.5 py-1 transition-all ${
                  status === st
                    ? 'text-[#e1e1e1] bg-white/[0.08] font-semibold shadow-sm'
                    : 'hover:text-[#e1e1e1]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#8c8c8c]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user / phone / ID..."
              className="h-8 w-48 sm:w-60 rounded-[4px] border border-white/[0.08] bg-black pl-8 pr-2.5 text-[12px] text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
            />
          </form>

          <button
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            disabled={loading}
            className="flex h-8 items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin text-[#2988ff]" /> : <Filter className="h-3 w-3 text-[#8c8c8c]" />}
            <span>Filter</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
        <table className="w-full text-left text-[12px] text-[#a6a6a6]">
          <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="px-4 py-3">Player / ID</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Deposit</th>
              <th className="px-4 py-3 text-right">Winnings</th>
              <th className="px-4 py-3 text-right">Bonus</th>
              <th className="px-4 py-3 text-right">Total Balance</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8c8c8c]">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2988ff] mb-2" />
                  <span>Loading authoritative player accounts...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8c8c8c] font-sans">
                  No player records found matching your filters.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const depositRupees = Number(u.deposit_balance || 0) / 100;
                const winningsRupees = Number(u.winnings_balance || 0) / 100;
                const bonusRupees = Number(u.rewards_balance || 0) / 100;
                const totalRupees = Number(u.available_balance || 0) / 100;
                const isProcessing = processingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link 
                          href={`/users/${u.id}`}
                          className="font-sans font-medium text-[#e1e1e1] hover:text-[#2988ff] flex items-center gap-1.5 transition-colors"
                        >
                          <span>{u.name || 'Unnamed Player'}</span>
                          <ExternalLink className="h-3 w-3 text-[#666]" />
                        </Link>
                        <div className="flex items-center gap-1 text-[10.5px] text-[#666] mt-0.5">
                          <span className="truncate max-w-[110px]">{u.id}</span>
                          <button
                            onClick={() => copyToClipboard(u.id)}
                            className="hover:text-[#a6a6a6] transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === u.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#a6a6a6]">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {u.is_blocked ? (
                        <span className="inline-flex items-center gap-1 rounded-[3px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10.5px] font-medium text-rose-400">
                          BANNED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10.5px] font-medium text-emerald-400">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[#a6a6a6]">
                      ₹{depositRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#a6a6a6]">
                      ₹{winningsRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#a6a6a6]">
                      ₹{bonusRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#e1e1e1]">
                      ₹{totalRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[#8c8c8c] text-[10.5px] whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/users/${u.id}`}
                          className="rounded-[3px] border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] font-sans font-medium text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => toggleBan(u)}
                          disabled={isProcessing}
                          title={u.is_blocked ? 'Unban User' : 'Ban User'}
                          className={`rounded-[3px] border p-1 text-[11px] transition-all disabled:opacity-50 ${
                            u.is_blocked
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : u.is_blocked ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserX className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.08] bg-black/40 px-4 py-2.5 text-[11.5px] text-[#8c8c8c]">
            <div>
              Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} players
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[#e1e1e1] px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex h-7 w-7 items-center justify-center rounded-[3px] border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
