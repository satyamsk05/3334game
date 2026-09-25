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
    <div className="space-y-space-6 font-mono text-sm">
      
      {/* Studio Page Header */}
      <div className="flex flex-col gap-space-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-space-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Player Directory</h1>
          <p className="text-xs text-text-secondary mt-space-1">
            Authoritative accounts with integer paise wallet accounting ({total} total)
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-space-2">
          {/* Status Tabs */}
          <div 
            role="group"
            aria-label="Filter players by account status"
            className="flex items-center rounded-xs border border-border-default bg-surface-raised p-space-1 text-xs text-text-secondary"
          >
            {['ALL', 'ACTIVE', 'BANNED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatus(st);
                  setPage(1);
                }}
                aria-pressed={status === st}
                className={`rounded-xs px-space-2.5 py-1 transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                  status === st
                    ? 'text-text-primary bg-border-default font-semibold shadow-sm'
                    : 'hover:text-text-primary text-text-secondary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user / phone / ID..."
              aria-label="Search user by name, phone or ID"
              className="h-8 w-48 sm:w-60 rounded-xs border border-border-default bg-surface-base pl-8 pr-space-2.5 text-xs text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
            />
          </form>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            loading={loading}
            icon={<Filter className="h-3 w-3 text-text-secondary" aria-hidden="true" />}
            aria-label="Filter player directory"
          >
            Filter
          </Button>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-space-2 rounded-md border border-status-negative/30 bg-status-negative/10 p-space-3 text-xs text-status-negative">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
        <table className="w-full text-left text-xs text-text-secondary">
          <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
            <tr>
              <th className="px-space-4 py-space-3">Player / ID</th>
              <th className="px-space-4 py-space-3">Phone</th>
              <th className="px-space-4 py-space-3">Status</th>
              <th className="px-space-4 py-space-3 text-right">Deposit</th>
              <th className="px-space-4 py-space-3 text-right">Winnings</th>
              <th className="px-space-4 py-space-3 text-right">Bonus</th>
              <th className="px-space-4 py-space-3 text-right">Total Balance</th>
              <th className="px-space-4 py-space-3">Registered</th>
              <th className="px-space-4 py-space-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted font-mono text-xs">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-space-4 py-space-8 text-center text-text-secondary">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent-primary mb-space-2" aria-hidden="true" />
                  <span>Loading authoritative player accounts...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
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
                  <tr key={u.id} className="hover:bg-surface-muted/60 transition-fast">
                    <td className="px-space-4 py-space-3">
                      <div className="flex flex-col">
                        <Link 
                          href={`/users/${u.id}`}
                          className="font-sans font-medium text-text-primary hover:text-accent-primary flex items-center gap-space-1.5 transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                        >
                          <span>{u.name || 'Unnamed Player'}</span>
                          <ExternalLink className="h-3 w-3 text-text-tertiary" aria-hidden="true" />
                        </Link>
                        <div className="flex items-center gap-space-1 text-xs text-text-tertiary mt-0.5">
                          <span className="truncate max-w-[110px]">{u.id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.id)}
                            className="p-0.5 rounded-xs hover:text-text-primary transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`Copy player ID ${u.id}`}
                            title="Copy ID"
                          >
                            {copiedId === u.id ? (
                              <Check className="h-2.5 w-2.5 text-status-positive" aria-hidden="true" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-space-4 py-space-3 text-text-secondary">
                      {u.phone || '—'}
                    </td>
                    <td className="px-space-4 py-space-3 font-sans">
                      {u.is_blocked ? (
                        <Badge variant="negative" ariaLabel="Account suspended">Banned</Badge>
                      ) : (
                        <Badge variant="positive" ariaLabel="Account active">Active</Badge>
                      )}
                    </td>
                    <td className="px-space-4 py-space-3 text-right text-text-secondary">
                      ₹{depositRupees.toFixed(2)}
                    </td>
                    <td className="px-space-4 py-space-3 text-right text-text-secondary">
                      ₹{winningsRupees.toFixed(2)}
                    </td>
                    <td className="px-space-4 py-space-3 text-right text-text-secondary">
                      ₹{bonusRupees.toFixed(2)}
                    </td>
                    <td className="px-space-4 py-space-3 text-right font-semibold text-text-primary">
                      ₹{totalRupees.toFixed(2)}
                    </td>
                    <td className="px-space-4 py-space-3 text-text-tertiary text-xs whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-space-4 py-space-3 text-center">
                      <div className="flex items-center justify-center gap-space-2">
                        <Link
                          href={`/users/${u.id}`}
                          className="rounded-xs border border-border-default bg-surface-base px-space-2 py-1 text-xs font-sans font-medium text-text-secondary hover:text-text-primary hover:border-border-default/80 transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleBan(u)}
                          disabled={isProcessing}
                          aria-label={u.is_blocked ? `Unban user ${u.name || u.id}` : `Ban user ${u.name || u.id}`}
                          title={u.is_blocked ? 'Unban User' : 'Ban User'}
                          className={`rounded-xs border p-1 text-xs transition-fast disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent-primary ${
                            u.is_blocked
                              ? 'border-status-positive/30 bg-status-positive/10 text-status-positive hover:bg-status-positive/20'
                              : 'border-status-negative/30 bg-status-negative/10 text-status-negative hover:bg-status-negative/20'
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          ) : u.is_blocked ? (
                            <UserCheck className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <UserX className="h-3 w-3" aria-hidden="true" />
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
          <div className="flex items-center justify-between border-t border-border-default bg-surface-muted px-space-4 py-space-2.5 text-xs text-text-secondary">
            <div>
              Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} players
            </div>
            <div className="flex items-center gap-space-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-xs border border-border-default bg-surface-raised hover:bg-border-default transition-fast disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="font-mono text-text-primary px-space-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-xs border border-border-default bg-surface-raised hover:bg-border-default transition-fast disabled:opacity-30 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              >
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
