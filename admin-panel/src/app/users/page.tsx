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
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
        setTotal(res.data.total ?? res.data.pagination?.total ?? res.data.users?.length ?? 0);
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
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Player Directory</h1>
            <Badge variant="mint">Live Accounts</Badge>
          </div>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Authoritative player accounts and integer paise wallet balances ({total} registered)
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl bg-white p-1 border border-gray-200/80 shadow-sm text-xs font-semibold text-gray-600">
            {['ALL', 'ACTIVE', 'BANNED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                className={`rounded-xl px-3.5 py-1.5 transition-fast ${
                  status === st
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player, phone, ID..."
              className="h-9 w-48 sm:w-60 rounded-full border border-gray-200/80 bg-white pl-9 pr-3 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 shadow-sm transition-fast"
            />
          </form>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            disabled={loading}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#f9fafb] border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Player / ID</th>
                <th className="py-3.5 px-6">Phone</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Deposit</th>
                <th className="py-3.5 px-6 text-right">Winnings</th>
                <th className="py-3.5 px-6 text-right">Bonus</th>
                <th className="py-3.5 px-6 text-right">Total Balance</th>
                <th className="py-3.5 px-6">Registered</th>
                <th className="py-3.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600 mb-2" />
                    <span>Loading player accounts...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                    No player records found matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const depositRupees = Number(u.deposit_balance ?? (u as any).balance?.depositPaise ?? 0) / 100;
                  const winningsRupees = Number(u.winnings_balance ?? (u as any).balance?.winningPaise ?? 0) / 100;
                  const bonusRupees = Number(u.rewards_balance ?? (u as any).balance?.bonusPaise ?? 0) / 100;
                  const totalRupees = Number(u.available_balance ?? (u as any).balance?.totalPaise ?? 0) / 100;
                  const isBlocked = Boolean(u.is_blocked ?? (u as any).isBanned);
                  const createdDate = u.created_at || (u as any).createdAt;
                  const isProcessing = processingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-fast">
                      <td className="py-3.5 px-6">
                        <div className="flex flex-col">
                          <Link 
                            href={`/users/${u.id}`}
                            className="font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1.5 transition-fast text-xs"
                          >
                            <span>{u.name || 'Unnamed Player'}</span>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mt-0.5">
                            <span className="truncate max-w-[110px]">{u.id}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(u.id)}
                              className="p-0.5 rounded hover:text-gray-700"
                              aria-label={`Copy player ID ${u.id}`}
                            >
                              {copiedId === u.id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-xs text-gray-600 font-mono">
                        {u.phone || '—'}
                      </td>

                      <td className="py-3.5 px-6">
                        {isBlocked ? (
                          <Badge variant="negative">Banned</Badge>
                        ) : (
                          <Badge variant="positive">Active</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right text-xs text-gray-500 font-medium">
                        ₹{depositRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right text-xs text-emerald-600 font-medium">
                        ₹{winningsRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right text-xs text-gray-500 font-medium">
                        ₹{bonusRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right font-bold text-xs text-gray-900">
                        ₹{totalRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-xs text-gray-400 whitespace-nowrap">
                        {createdDate ? new Date(createdDate).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/users/${u.id}`}>
                            <Button variant="secondary" size="sm">
                              Profile
                            </Button>
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleBan(u)}
                            disabled={isProcessing}
                            title={isBlocked ? 'Unban User' : 'Ban User'}
                            className={`rounded-xl p-2 text-xs transition-fast ${
                              isBlocked
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isBlocked ? (
                              <UserCheck className="h-3.5 w-3.5" />
                            ) : (
                              <UserX className="h-3.5 w-3.5" />
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
            <div className="flex items-center justify-between border-t border-gray-100 bg-[#f9fafb] px-6 py-3 text-xs text-gray-500 font-medium">
              <div>
                Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} players
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-fast disabled:opacity-40 shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-gray-900 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-fast disabled:opacity-40 shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
