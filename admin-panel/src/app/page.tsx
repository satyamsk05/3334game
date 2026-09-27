'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Activity,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function OverviewDashboard() {
  const [range, setRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNetwork, setIsNetwork] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const activeRequestRef = useRef<number>(0);

  const fetchLiveMetrics = useCallback(async (selectedRange: string = range) => {
    const requestId = ++activeRequestRef.current;
    try {
      setLoading(true);
      setError(null);
      setIsNetwork(false);
      const res = await adminService.getDashboardStats(selectedRange);
      // Guard against race conditions from out-of-order response completion
      if (requestId === activeRequestRef.current) {
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          setError(res.message || 'Failed to fetch dashboard metrics');
        }
      }
    } catch (err: any) {
      if (requestId === activeRequestRef.current) {
        console.error('Metrics sync error:', err);
        setIsNetwork(!!err.isNetwork);
        if (err.isForbidden) {
          setError('You do not have permission to view telemetry metrics.');
        } else {
          setError(err.message || 'Telemetry connection error');
        }
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
      }
    }
  }, [range]);

  useEffect(() => {
    fetchLiveMetrics(range);
    return () => {
      // Invalidate current request on cleanup / range switch
      activeRequestRef.current++;
    };
  }, [range, fetchLiveMetrics]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const users = stats?.users || {};
  const wallet = stats?.wallet || {};
  const deposits = stats?.deposits || {};
  const withdrawals = stats?.withdrawals || {};
  const games = stats?.games || {};
  const recentActivity = stats?.recentActivity || [];

  const totalDepositRupees = Number(wallet.totalDepositPaise || 0) / 100;
  const totalWinningRupees = Number(wallet.totalWinningPaise || 0) / 100;
  const totalBonusRupees = Number(wallet.totalBonusPaise || 0) / 100;
  const totalAvailableRupees = Number(wallet.totalAvailablePaise || 0) / 100;

  const totalWageredRupees = Number(games.totalWageredPaise || 0) / 100;
  const ggrRupees = Number(games.ggrPaise || 0) / 100;

  const approvedDepositRupees = Number(deposits.approvedAmountPaise || 0) / 100;
  const approvedWithdrawRupees = Number(withdrawals.approvedAmountPaise || 0) / 100;
  const pendingWithdrawRupees = Number(withdrawals.pendingAmountPaise || 0) / 100;
  const pendingPayoutsCount = Number(withdrawals.pendingCount || 0);

  const formatRupees = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)}k`;
    return `₹ ${val.toFixed(2)}`;
  };

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
        return <Badge variant="warning">Pending</Badge>;
      case 'WITHDRAWAL_SETTLE':
        return <Badge variant="neutral">Paid Out</Badge>;
      case 'WITHDRAWAL_REVERT':
        return <Badge variant="positive">Reverted</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="positive">Admin Credit</Badge>;
      case 'ADMIN_DEBIT':
        return <Badge variant="negative">Admin Debit</Badge>;
      case 'PROMO_BONUS':
        return <Badge variant="mint">Promo Bonus</Badge>;
      default:
        return <Badge variant="neutral">{txType}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-[#fcfcfc]">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white text-balance">
            Platform Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 text-pretty">
            Track deposits, players and game revenue.
          </p>
        </div>

        {/* Date Filters & Sync Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md bg-[#0c0c0e] p-0.5 border border-white/[0.08] text-xs font-medium text-zinc-400">
            {(['24h', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`rounded px-2.5 py-1 text-xs transition-colors ${
                  range === t
                    ? 'bg-white text-black font-medium'
                    : 'hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLiveMetrics(range)}
            disabled={loading}
            aria-label="Refresh telemetry"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-white' : 'text-zinc-400'}`} strokeWidth={1.75} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-rose-500/25 bg-rose-950/20 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
          {isNetwork && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchLiveMetrics(range)}
              disabled={loading}
              className="self-start sm:self-auto bg-rose-900/30 hover:bg-rose-900/50 text-rose-200 border-rose-700/40"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Overview Cards (Calm, monochrome-first, identical internal layout) */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-medium text-zinc-400 text-balance">
          Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: GGR / Earnings */}
          <Card className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-400">
                  <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs font-medium text-zinc-400">
                  Gaming revenue (GGR)
                </span>
                <div className="mt-1">
                  <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
                    {formatRupees(ggrRupees)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium tabular-nums">
                <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                95.0% RTP
              </span>
              <span className="text-zinc-500 font-normal tabular-nums">Turnover: ₹{totalWageredRupees.toFixed(0)}</span>
            </div>
          </Card>

          {/* Card 2: Customers / Active Players */}
          <Card className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-400">
                  <Users className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs font-medium text-zinc-400">
                  Total players
                </span>
                <div className="mt-1">
                  <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
                    {users.totalUsers || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span className="font-normal text-zinc-300 tabular-nums">
                {users.activeUsers || 0} active
              </span>
              <span className="text-zinc-500 font-normal tabular-nums">
                {users.bannedUsers || 0} blocked
              </span>
            </div>
          </Card>

          {/* Card 3: Player Wallet Liquidity */}
          <Card className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-400">
                  <Wallet className="h-4 w-4" strokeWidth={1.75} />
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs font-medium text-zinc-400">
                  Player balances
                </span>
                <div className="mt-1">
                  <span className="text-2xl font-semibold text-white tracking-tight tabular-nums">
                    {formatRupees(totalAvailableRupees)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span>Dep: <span className="text-zinc-200 tabular-nums">₹{totalDepositRupees.toFixed(0)}</span></span>
              <span>Win: <span className="text-zinc-200 tabular-nums">₹{totalWinningRupees.toFixed(0)}</span></span>
              <span>Bonus: <span className="text-zinc-200 tabular-nums">₹{totalBonusRupees.toFixed(0)}</span></span>
            </div>
          </Card>

          {/* Card 4: Action Required / Pending Payouts */}
          <Card 
            variant={pendingPayoutsCount > 0 ? 'urgent' : 'default'} 
            className="flex flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] ${
                  pendingPayoutsCount > 0 ? 'text-amber-400' : 'text-zinc-400'
                }`}>
                  {pendingPayoutsCount > 0 ? (
                    <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </div>
                {pendingPayoutsCount > 0 ? (
                  <Badge variant="warning">
                    Action required
                  </Badge>
                ) : (
                  <Badge variant="neutral">
                    All settled
                  </Badge>
                )}
              </div>

              <div className="mt-3">
                <span className="text-xs font-medium text-zinc-400">
                  Payout queue
                </span>
                <div className="mt-1">
                  <span className={`text-2xl font-semibold tracking-tight tabular-nums ${
                    pendingPayoutsCount > 0 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {pendingPayoutsCount} pending
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
              <span>
                Total: <span className="text-zinc-200 font-medium tabular-nums">₹{pendingWithdrawRupees.toFixed(2)}</span>
              </span>
              <span className={pendingPayoutsCount > 0 ? 'text-amber-400 font-medium' : 'text-zinc-500'}>
                {pendingPayoutsCount > 0 ? 'Review UPI' : 'Cleared'}
              </span>
            </div>
          </Card>

        </div>
      </div>

      {/* Live Engine Runtime Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 bg-[#0c0c0e] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-zinc-400 shrink-0">
            <Activity className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white text-xs">Ring of Future Engine</h3>
              <Badge variant="positive">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
                {games.engineState?.state || 'Active'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Round #{games.totalRoundsPlayed || 0} • Time left: <span className="text-zinc-200 font-medium tabular-nums">{games.engineState?.timeLeft || 0}s</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-400 font-normal">
          <div>
            <span className="text-zinc-500 block text-[11px]">Bet range</span>
            <span className="text-zinc-200 font-medium tabular-nums">₹{games.rtpConfig?.minBetRupees || 10} - ₹{games.rtpConfig?.maxBetRupees || 10000}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Deposits</span>
            <span className="text-zinc-200 font-medium tabular-nums">₹{approvedDepositRupees.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Payouts</span>
            <span className="text-zinc-200 font-medium tabular-nums">₹{approvedWithdrawRupees.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      {/* Product Activity / Ledger Stream Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-medium text-zinc-400 text-balance">
              Transactions
            </h2>
            <p className="text-xs text-zinc-500 text-pretty">Recent wallet transactions and settlement logs.</p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" strokeWidth={1.75} />}
        </div>

        <Card className="overflow-hidden p-0 border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-white/[0.08] text-zinc-400 text-xs font-medium bg-[#141417]/50">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Transaction ID</th>
                  <th className="py-2.5 px-4 font-medium">Player</th>
                  <th className="py-2.5 px-4 font-medium">Type</th>
                  <th className="py-2.5 px-4 font-medium">Bucket</th>
                  <th className="py-2.5 px-4 text-right font-medium">Amount</th>
                  <th className="py-2.5 px-4 text-right font-medium">Balance after</th>
                  <th className="py-2.5 px-4 font-medium">Reference</th>
                  <th className="py-2.5 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs">
                      No transaction entries recorded in this time period.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((tx: any) => {
                    const amountRupees = Number(tx.amount || 0) / 100;
                    const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                    const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 text-zinc-300 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[110px]" title={tx.id}>
                              {tx.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(tx.id)}
                              className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
                              aria-label={`Copy transaction ID ${tx.id}`}
                            >
                              {copiedId === tx.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-2.5 px-4 font-medium text-white text-xs">
                          <span className="truncate max-w-[120px] block" title={tx.user_name || tx.user_id}>
                            {tx.user_name || tx.user_id}
                          </span>
                        </td>

                        <td className="py-2.5 px-4">
                          {getTransactionBadge(tx.transaction_type)}
                        </td>

                        <td className="py-2.5 px-4 text-xs text-zinc-400 capitalize">
                          {String(tx.bucket || '').toLowerCase()}
                        </td>

                        <td className={`py-2.5 px-4 text-right font-medium text-xs tabular-nums ${
                          isCredit ? 'text-emerald-400' : 'text-zinc-200'
                        }`}>
                          {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                        </td>

                        <td className="py-2.5 px-4 text-right font-normal text-zinc-300 text-xs font-mono tabular-nums">
                          ₹{balanceAfterRupees.toFixed(2)}
                        </td>

                        <td className="py-2.5 px-4 text-xs text-zinc-500 truncate max-w-[140px]" title={tx.description || tx.reference_id}>
                          {tx.description || tx.reference_id || '—'}
                        </td>

                        <td className="py-2.5 px-4 text-xs text-zinc-500 whitespace-nowrap">
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
