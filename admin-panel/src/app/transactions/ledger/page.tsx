'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Filter,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Coins,
  Search,
  ExternalLink
} from 'lucide-react';
import { adminService, LedgerItem } from '@/services/adminService';

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Authoritative Wallet Ledger</h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-mono text-emerald-400 border border-emerald-500/20">
              Immutable Records
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">
            Single source of truth double-entry financial ledger in integer paise ({total} matching transactions)
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* System Reserves Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total System Balance</span>
          <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{totalAvailableRupees.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">{overview?.totalWallets || 0} active user wallets</p>
        </div>
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Deposit Bucket</span>
          <div className="mt-2 text-xl font-bold font-mono text-[#a6a6a6]">₹{totalDepositRupees.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Player deposited principal</p>
        </div>
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Winnings Bucket</span>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">₹{totalWinningRupees.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Game winning payouts</p>
        </div>
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Bonus Bucket</span>
          <div className="mt-2 text-xl font-bold font-mono text-[#a6a6a6]">₹{totalBonusRupees.toFixed(2)}</div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Promotional non-negative balance</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 rounded-[8px] border border-white/[0.08] bg-[#212123] p-3 text-[12px]">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-[#8c8c8c]" />
          <input
            type="text"
            value={userIdFilter}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Filter by User ID (e.g. USR-...)"
            className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={txTypeFilter}
            onChange={(e) => {
              setTxTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-[4px] border border-white/[0.08] bg-black px-2 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
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
            className="h-8 rounded-[4px] border border-white/[0.08] bg-black px-2 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
          >
            <option value="ALL">All Buckets</option>
            <option value="deposit">Deposit Bucket</option>
            <option value="winnings">Winnings Bucket</option>
            <option value="bonus">Bonus Bucket</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex h-8 items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3 font-medium text-white hover:bg-[#2988ff]/90 transition-all shadow-sm"
        >
          <Filter className="h-3 w-3" />
          <span>Apply Filter</span>
        </button>
      </form>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
        <table className="w-full text-left text-[12px] text-[#a6a6a6]">
          <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="px-4 py-3">Ledger ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bucket</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Balance Before</th>
              <th className="px-4 py-3 text-right">Balance After</th>
              <th className="px-4 py-3">Reference / Description</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8c8c8c]">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2988ff] mb-2" />
                  <span>Loading ledger records from PostgreSQL...</span>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[#8c8c8c] font-sans">
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
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[#e1e1e1]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[90px]">{tx.id}</span>
                        <button
                          onClick={() => copyToClipboard(tx.id)}
                          className="text-[#666] hover:text-[#e1e1e1]"
                          title="Copy ID"
                        >
                          {copiedId === tx.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#e1e1e1]">
                      <Link
                        href={`/users/${tx.user_id}`}
                        className="flex items-center gap-1 hover:text-[#2988ff] transition-colors"
                      >
                        <span className="truncate max-w-[120px]">{tx.user_name || tx.user_id}</span>
                        <ExternalLink className="h-2.5 w-2.5 text-[#666]" />
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono font-medium ${
                        isCredit
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 uppercase text-[#8c8c8c] text-[10.5px]">
                      {tx.bucket}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCredit ? '+' : '-'}₹{Math.abs(amtRupees).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[#8c8c8c]">
                      ₹{beforeRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#e1e1e1]">
                      ₹{afterRupees.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[#8c8c8c] truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                      {tx.description || tx.reference_id || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#8c8c8c] text-[10.5px] whitespace-nowrap">
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
          <div className="flex items-center justify-between border-t border-white/[0.08] bg-black/40 px-4 py-2.5 text-[11.5px] text-[#8c8c8c]">
            <div>
              Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} records
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
