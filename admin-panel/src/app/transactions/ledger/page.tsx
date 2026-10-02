'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filter,
  Copy,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Wallet
} from 'lucide-react';
import { adminService, LedgerItem } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function LedgerManagementPage() {
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<LedgerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [userIdFilter, setUserIdFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');
  const [bucketFilter, setBucketFilter] = useState('ALL');

  const fetchOverview = async () => {
    try {
      const res = await adminService.getLedgerOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error('Error fetching ledger overview:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.queryLedger({
        page,
        limit,
        userId: userIdFilter.trim() || undefined,
        transactionType: txTypeFilter === 'ALL' ? undefined : txTypeFilter,
        bucket: bucketFilter === 'ALL' ? undefined : bucketFilter
      });
      if (res.success && res.data) {
        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0);
      } else {
        setTransactions([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Error querying ledger:', err);
      setError(err.response?.data?.message || err.message || 'Error querying ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [page, txTypeFilter, bucketFilter]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const totalAvailableRupees = Number(overview?.totalAvailablePaise || 0) / 100;
  const totalDepositRupees = Number(overview?.totalDepositPaise || 0) / 100;
  const totalWinningRupees = Number(overview?.totalWinningPaise || 0) / 100;
  const totalBonusRupees = Number(overview?.totalBonusPaise || 0) / 100;

  const getTransactionBadge = (txType: string) => {
    switch (txType) {
      case 'DEPOSIT':
        return <Badge variant="positive">Deposit</Badge>;
      case 'WIN_PAYOUT':
        return <Badge variant="positive">Win Payout</Badge>;
      case 'BET_REFUND':
        return <Badge variant="info">Refund</Badge>;
      case 'BET_DEBIT':
        return <Badge variant="neutral">Bet Debit</Badge>;
      case 'WITHDRAWAL_HOLD':
        return <Badge variant="warning">Hold</Badge>;
      case 'WITHDRAWAL_SETTLE':
        return <Badge variant="neutral">Paid Out</Badge>;
      case 'WITHDRAWAL_REVERT':
        return <Badge variant="positive">Revert</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="positive">Credit Adj</Badge>;
      case 'ADMIN_DEBIT':
        return <Badge variant="negative">Debit Adj</Badge>;
      case 'PROMO_BONUS':
        return <Badge variant="mint">Promo Bonus</Badge>;
      default:
        return <Badge variant="neutral">{txType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Wallet ledger</h1>
            <Badge variant="mint">Immutable Stream</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Single source of truth double-entry financial ledger in integer paise ({total} matching transactions)
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* System Reserves Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Total System Balance</span>
          <div className="mt-2 text-3xl font-extrabold text-text-primary">₹{totalAvailableRupees.toFixed(2)}</div>
          <p className="mt-2 text-xs font-medium text-text-tertiary">{overview?.totalWallets || 0} active wallets</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Deposit Bucket</span>
          <div className="mt-2 text-3xl font-extrabold text-text-primary">₹{totalDepositRupees.toFixed(2)}</div>
          <p className="mt-2 text-xs font-medium text-text-tertiary">Player deposited principal</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Winnings Bucket</span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">₹{totalWinningRupees.toFixed(2)}</div>
          <p className="mt-2 text-xs font-medium text-emerald-600/70">Game winning payouts</p>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Bonus Bucket</span>
          <div className="mt-2 text-3xl font-extrabold text-text-primary">₹{totalBonusRupees.toFixed(2)}</div>
          <p className="mt-2 text-xs font-medium text-text-tertiary">Promotional non-negative balance</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 sm:p-5">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-surface-strong rounded-xl px-3.5 py-1.5 border border-border-default">
            <Search className="h-4 w-4 text-text-tertiary shrink-0" />
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              placeholder="Search by User ID (e.g. USR-...)"
              className="w-full bg-transparent text-text-primary placeholder:text-text-tertiary text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <select
              value={txTypeFilter}
              onChange={(e) => {
                setTxTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-border-default bg-surface-raised px-3.5 text-xs font-medium text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            >
              <option value="ALL">All Types</option>
              <option value="DEPOSIT">DEPOSIT</option>
              <option value="BET_DEBIT">BET_DEBIT</option>
              <option value="BET_REFUND">BET_REFUND</option>
              <option value="WIN_PAYOUT">WIN_PAYOUT</option>
              <option value="WITHDRAWAL_HOLD">WITHDRAWAL_HOLD</option>
              <option value="WITHDRAWAL_SETTLE">WITHDRAWAL_SETTLE</option>
              <option value="WITHDRAWAL_REVERT">WITHDRAWAL_REVERT</option>
              <option value="ADMIN_CREDIT">ADMIN_CREDIT</option>
              <option value="ADMIN_DEBIT">ADMIN_DEBIT</option>
              <option value="PROMO_BONUS">PROMO_BONUS</option>
            </select>
          </div>

          <div>
            <select
              value={bucketFilter}
              onChange={(e) => {
                setBucketFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-border-default bg-surface-raised px-3.5 text-xs font-medium text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
            >
              <option value="ALL">All Buckets</option>
              <option value="deposit">Deposit Bucket</option>
              <option value="winnings">Winnings Bucket</option>
              <option value="bonus">Bonus Bucket</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="dark"
            size="md"
          >
            <Filter className="h-4 w-4.5" />
            <span>Apply</span>
          </Button>
        </form>
      </Card>

      {/* Ledger Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary min-w-[900px]">
            <thead className="bg-surface-strong/50 border-b border-border-subtle text-text-tertiary text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Ledger ID</th>
                <th className="py-3.5 px-6">Player</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Bucket</th>
                <th className="py-3.5 px-6 text-right">Amount</th>
                <th className="py-3.5 px-6 text-right">Before</th>
                <th className="py-3.5 px-6 text-right">After</th>
                <th className="py-3.5 px-6">Reference / Notes</th>
                <th className="py-3.5 px-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-tertiary text-sm">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600 mb-2" />
                    <span>Loading ledger records from PostgreSQL...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-text-tertiary text-sm">
                    No ledger entries matching the specified criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const amtRupees = Number(tx.amount || 0) / 100;
                  const beforeRupees = Number(tx.balance_before || 0) / 100;
                  const afterRupees = Number(tx.balance_after || 0) / 100;
                  const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT', 'WITHDRAWAL_REVERT'].includes(tx.transaction_type);

                  return (
                    <tr key={tx.id} className="hover:bg-surface-strong/40 transition-fast">
                      <td className="py-3.5 px-6 text-text-primary font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[100px]" title={tx.id}>{tx.id}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.id)}
                            className="p-1 rounded-md text-text-tertiary hover:text-text-primary transition-fast"
                            aria-label={`Copy transaction ID ${tx.id}`}
                          >
                            {copiedId === tx.id ? (
                              <Check className="h-4 w-4.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-text-primary font-semibold text-xs">
                        <Link
                          href={`/users/${tx.user_id}`}
                          className="flex items-center gap-1 hover:text-accent-primary transition-fast"
                        >
                          <span className="truncate max-w-[120px]">{tx.user_name || tx.user_id}</span>
                          <ExternalLink className="h-4 w-4 text-text-tertiary" />
                        </Link>
                      </td>

                      <td className="py-3.5 px-6">
                        {getTransactionBadge(tx.transaction_type)}
                      </td>

                      <td className="py-3.5 px-6 uppercase text-text-secondary font-medium text-xs">
                        {tx.bucket}
                      </td>

                      <td className={`py-3.5 px-6 text-right font-bold text-xs ${
                        isCredit ? 'text-emerald-600' : 'text-text-primary'
                      }`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amtRupees).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right text-text-tertiary text-xs">
                        ₹{beforeRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-right font-bold text-text-primary text-xs">
                        ₹{afterRupees.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-6 text-xs text-text-tertiary truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '—'}
                      </td>

                      <td className="py-3.5 px-6 text-xs text-text-tertiary whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-subtle bg-surface-strong/50 px-6 py-3 text-xs text-text-secondary font-medium">
              <div>
                Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised border border-border-default hover:bg-surface-strong transition-fast disabled:opacity-40 shadow-sm"
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
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised border border-border-default hover:bg-surface-strong transition-fast disabled:opacity-40 shadow-sm"
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
