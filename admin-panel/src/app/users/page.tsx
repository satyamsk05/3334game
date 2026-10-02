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
import { Modal } from '@/components/ui/Modal';

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

  // Modal State for Ban/Unban
  const [banModalUser, setBanModalUser] = useState<UserSummary | null>(null);
  const [banReason, setBanReason] = useState('Terms of service violation');

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

  const openBanModal = (user: UserSummary) => {
    setBanModalUser(user);
    setBanReason(user.is_blocked ? '' : 'Terms of service violation');
  };

  const handleConfirmBanToggle = async () => {
    if (!banModalUser) return;
    const user = banModalUser;
    const currentBan = Boolean(user.is_blocked);
    try {
      setProcessingId(user.id);
      const res = await adminService.toggleBan(user.id, !currentBan, banReason);
      if (res.success) {
        await fetchUsers();
        setBanModalUser(null);
      } else {
        setError(res.message || 'Action failed');
      }
    } catch (err: any) {
      setError(`Action failed: ${err.response?.data?.message || err.message}`);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Player Directory</h1>
            <Badge variant="mint">Live Accounts</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Authoritative player accounts and integer paise wallet balances ({total} registered)
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg bg-surface-raised p-1 border border-border-default shadow-xs text-xs font-semibold text-text-secondary">
            {['ALL', 'ACTIVE', 'BANNED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                className={`rounded-md px-3.5 py-1.5 transition-all ${
                  status === st
                    ? 'bg-accent-primary text-text-inverse shadow-xs'
                    : 'hover:text-text-primary hover:bg-surface-strong'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player, phone, ID..."
              className="h-10 w-48 sm:w-64 rounded-lg border border-border-default bg-surface-strong/70 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong focus:bg-surface-raised shadow-xs transition-all"
            />
          </form>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            disabled={loading}
            icon={<Filter className="h-4 w-4" />}
          >
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <Card className="overflow-hidden p-0 rounded-xl bg-surface-raised border border-border-default shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary min-w-[900px]">
            <thead className="bg-surface-strong/50 border-b border-border-subtle text-text-tertiary text-xs font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-text-tertiary text-sm">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-primary mb-2" />
                    <span>Loading player accounts...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-text-tertiary text-sm">
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
                    <tr key={u.id} className="hover:bg-surface-strong/40 transition-colors duration-150">
                      <td className="py-3.5 px-6">
                        <div className="flex flex-col">
                          <Link 
                            href={`/users/${u.id}`}
                            className="font-semibold text-text-primary hover:text-accent-primary flex items-center gap-1.5 transition-colors text-sm"
                          >
                            <span>{u.name || 'Unnamed Player'}</span>
                            <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-text-tertiary font-mono mt-0.5">
                            <span className="truncate max-w-[120px]">{u.id}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(u.id)}
                              className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
                              aria-label={`Copy player ID ${u.id}`}
                            >
                              {copiedId === u.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-sm text-text-primary font-mono">
                        {u.phone ? (u.phone.startsWith('91') && u.phone.length === 12 ? `+91 ${u.phone.slice(2)}` : u.phone) : '—'}
                      </td>

                      <td className="py-3.5 px-6">
                        {isBlocked ? (
                          <Badge variant="negative">Banned</Badge>
                        ) : (
                          <Badge variant="positive">Active</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right text-sm text-text-secondary font-medium tabular-nums">
                        ₹{depositRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right text-sm text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                        ₹{winningsRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right text-sm text-text-secondary font-medium tabular-nums">
                        ₹{bonusRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right font-bold text-sm text-text-primary tabular-nums">
                        ₹{totalRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-sm text-text-tertiary whitespace-nowrap">
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
                            onClick={() => openBanModal(u)}
                            disabled={isProcessing}
                            aria-label={isBlocked ? `Unban user ${u.name || u.id}` : `Ban user ${u.name || u.id}`}
                            title={isBlocked ? 'Unban User' : 'Ban User'}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition-all ${
                              isBlocked
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/25'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isBlocked ? (
                              <UserCheck className="h-4 w-4" />
                            ) : (
                              <UserX className="h-4 w-4" />
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
            <div className="flex items-center justify-between border-t border-border-subtle bg-surface-strong/30 px-6 py-3.5 text-xs text-text-secondary font-medium">
              <div>
                Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} players
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised border border-border-default hover:bg-surface-strong transition-all disabled:opacity-40 shadow-xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-text-primary px-2">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  aria-label="Next page"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised border border-border-default hover:bg-surface-strong transition-all disabled:opacity-40 shadow-xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation & Ban Management Modal */}
      <Modal
        isOpen={Boolean(banModalUser)}
        onClose={() => setBanModalUser(null)}
        title={banModalUser?.is_blocked ? 'Unban Player Account' : 'Restrict Player Account'}
        description={
          banModalUser?.is_blocked
            ? `Reactivate account for ${banModalUser?.name || banModalUser?.id}`
            : `Set restriction or ban for player ${banModalUser?.name || banModalUser?.id}`
        }
      >
        <div className="space-y-4">
          {!banModalUser?.is_blocked && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary">Reason for restriction</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="E.g., Suspicious activity, Terms violation..."
                className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-strong focus:bg-surface-raised transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setBanModalUser(null)}
              disabled={Boolean(processingId)}
            >
              Cancel
            </Button>
            <Button
              variant={banModalUser?.is_blocked ? 'primary' : 'danger'}
              size="md"
              loading={Boolean(processingId)}
              onClick={handleConfirmBanToggle}
            >
              {banModalUser?.is_blocked ? 'Unban Account' : 'Confirm Ban'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
