'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Filter,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink
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
        return <Badge variant="positive" ariaLabel="Deposit transaction">Deposit</Badge>;
      case 'WIN_PAYOUT':
        return <Badge variant="positive" ariaLabel="Winning payout transaction">Win Payout</Badge>;
      case 'BET_REFUND':
        return <Badge variant="positive" ariaLabel="Bet refund transaction">Refund</Badge>;
      case 'BET_DEBIT':
        return <Badge variant="neutral" ariaLabel="Bet debit transaction">Bet Debit</Badge>;
      case 'WITHDRAWAL_HOLD':
        return <Badge variant="warning" ariaLabel="Withdrawal hold transaction">Hold</Badge>;
      case 'WITHDRAWAL_SETTLE':
        return <Badge variant="neutral" ariaLabel="Withdrawal settled transaction">Withdrawal</Badge>;
      case 'WITHDRAWAL_REVERT':
        return <Badge variant="positive" ariaLabel="Withdrawal reverted transaction">Revert</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="positive" ariaLabel="Admin credit adjustment">Credit Adj</Badge>;
      case 'ADMIN_DEBIT':
        return <Badge variant="negative" ariaLabel="Admin debit adjustment">Debit Adj</Badge>;
      case 'PROMO_BONUS':
        return <Badge variant="info" ariaLabel="Promotional bonus transaction">Promo Bonus</Badge>;
      default:
        return <Badge variant="neutral" ariaLabel={`${txType} transaction`}>{txType}</Badge>;
    }
  };

  return (
    <div className="space-y-space-6 font-mono text-sm">
      
      {/* Header */}
      <div className="flex flex-col gap-space-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-space-5">
        <div>
          <div className="flex items-center gap-space-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Authoritative Wallet Ledger</h1>
            <Badge variant="positive" ariaLabel="Records are tamper-evident and immutable">
              Immutable Records
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-space-1">
            Single source of truth double-entry financial ledger in integer paise ({total} matching transactions)
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-status-negative/30 bg-status-negative/10 p-space-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {/* System Reserves Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4">
        <Card variant="default">
          <span className="text-xs text-text-secondary uppercase">Total System Balance</span>
          <div className="mt-space-2 text-xl font-bold font-mono text-text-primary">₹{totalAvailableRupees.toFixed(2)}</div>
          <p className="mt-space-1 text-xs text-text-tertiary">{overview?.totalWallets || 0} active user wallets</p>
        </Card>
        <Card variant="default">
          <span className="text-xs text-text-secondary uppercase">Deposit Bucket</span>
          <div className="mt-space-2 text-xl font-bold font-mono text-text-primary">₹{totalDepositRupees.toFixed(2)}</div>
          <p className="mt-space-1 text-xs text-text-tertiary">Player deposited principal</p>
        </Card>
        <Card variant="default">
          <span className="text-xs text-text-secondary uppercase">Winnings Bucket</span>
          <div className="mt-space-2 text-xl font-bold font-mono text-status-positive">₹{totalWinningRupees.toFixed(2)}</div>
          <p className="mt-space-1 text-xs text-text-tertiary">Game winning payouts</p>
        </Card>
        <Card variant="default">
          <span className="text-xs text-text-secondary uppercase">Bonus Bucket</span>
          <div className="mt-space-2 text-xl font-bold font-mono text-text-primary">₹{totalBonusRupees.toFixed(2)}</div>
          <p className="mt-space-1 text-xs text-text-tertiary">Promotional non-negative balance</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-space-3 rounded-lg border border-border-default bg-surface-raised p-space-3 text-xs">
        <div className="flex items-center gap-space-1.5 flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Filter by User ID (e.g. USR-...)"
            aria-label="Filter ledger by User ID"
            className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 font-mono text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
          />
        </div>

        <div>
          <select
            value={txTypeFilter}
            onChange={(e) => {
              setTxTypeFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by transaction type"
            className="h-8 rounded-xs border border-border-default bg-surface-base px-space-2 text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
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
            aria-label="Filter by balance bucket"
            className="h-8 rounded-xs border border-border-default bg-surface-base px-space-2 text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
          >
            <option value="ALL">All Buckets</option>
            <option value="deposit">Deposit Bucket</option>
            <option value="winnings">Winnings Bucket</option>
            <option value="bonus">Bonus Bucket</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={<Filter className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          Apply Filter
        </Button>
      </form>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
        <table className="w-full text-left text-xs text-text-secondary">
          <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
            <tr>
              <th className="px-space-4 py-space-3">Ledger ID</th>
              <th className="px-space-4 py-space-3">User</th>
              <th className="px-space-4 py-space-3">Type</th>
              <th className="px-space-4 py-space-3">Bucket</th>
              <th className="px-space-4 py-space-3 text-right">Amount</th>
              <th className="px-space-4 py-space-3 text-right">Balance Before</th>
              <th className="px-space-4 py-space-3 text-right">Balance After</th>
              <th className="px-space-4 py-space-3">Reference / Description</th>
              <th className="px-space-4 py-space-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-muted font-mono text-xs">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-space-4 py-space-8 text-center text-text-secondary">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent-primary mb-space-2" aria-hidden="true" />
                  <span>Loading ledger records from PostgreSQL...</span>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
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
                  <tr key={tx.id} className="hover:bg-surface-muted/60 transition-fast">
                    {/* Truncated Ledger ID */}
                    <td className="px-space-4 py-space-3 text-text-primary">
                      <div className="flex items-center gap-space-1.5">
                        <span className="truncate max-w-[100px]" title={tx.id}>{tx.id}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(tx.id)}
                          className="p-1 rounded-xs text-text-secondary hover:text-text-primary hover:bg-border-default transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                          aria-label={`Copy transaction ID ${tx.id}`}
                          title="Copy ID"
                        >
                          {copiedId === tx.id ? (
                            <Check className="h-3 w-3 text-status-positive" aria-hidden="true" />
                          ) : (
                            <Copy className="h-3 w-3" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* User Link */}
                    <td className="px-space-4 py-space-3 text-text-primary">
                      <Link
                        href={`/users/${tx.user_id}`}
                        className="flex items-center gap-space-1 hover:text-accent-primary transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary"
                      >
                        <span className="truncate max-w-[120px]">{tx.user_name || tx.user_id}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-text-tertiary" aria-hidden="true" />
                      </Link>
                    </td>

                    {/* Visible Labeled TYPE */}
                    <td className="px-space-4 py-space-3 font-sans">
                      {getTransactionBadge(tx.transaction_type)}
                    </td>

                    {/* Bucket */}
                    <td className="px-space-4 py-space-3 uppercase text-text-secondary text-xs">
                      {tx.bucket}
                    </td>

                    {/* Amount */}
                    <td className={`px-space-4 py-space-3 text-right font-semibold ${
                      isCredit ? 'text-status-positive' : 'text-text-primary'
                    }`}>
                      {isCredit ? '+' : '-'}₹{Math.abs(amtRupees).toFixed(2)}
                    </td>

                    {/* Balance Before */}
                    <td className="px-space-4 py-space-3 text-right text-text-secondary">
                      ₹{beforeRupees.toFixed(2)}
                    </td>

                    {/* Balance After */}
                    <td className="px-space-4 py-space-3 text-right font-medium text-text-primary">
                      ₹{afterRupees.toFixed(2)}
                    </td>

                    {/* Reference */}
                    <td className="px-space-4 py-space-3 text-text-secondary truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                      {tx.description || tx.reference_id || '—'}
                    </td>

                    {/* Timestamp */}
                    <td className="px-space-4 py-space-3 text-text-tertiary text-xs whitespace-nowrap">
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
          <div className="flex items-center justify-between border-t border-border-default bg-surface-muted px-space-4 py-space-2.5 text-xs text-text-secondary">
            <div>
              Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} records
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
