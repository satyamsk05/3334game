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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Platform Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Authoritative financial telemetry & gaming engine operations
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
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {t.toUpperCase()}
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
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-white' : 'text-zinc-400'}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3.5 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          {isNetwork && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchLiveMetrics(range)}
              disabled={loading}
              className="self-start sm:self-auto bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border-rose-700/50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Overview Cards (Sleek Dark Theme) */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300 tracking-tight uppercase font-mono text-[11px]">
          Key Telemetry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: GGR / Earnings */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-sky-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <Badge variant="mint">
                  Live Engine
                </Badge>
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Gaming Revenue (GGR)
                  <HelpCircle className="h-3 w-3 text-zinc-600" />
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {formatRupees(ggrRupees)}
                  </span>
                  {/* Decorative neon sparkline */}
                  <svg className="w-16 h-8 stroke-emerald-400 fill-none" viewBox="0 0 100 40">
                    <path
                      d="M 5,30 Q 30,38 50,15 T 95,10"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <ArrowUpRight className="h-3 w-3" />
                95.0% RTP
              </span>
              <span className="text-zinc-500 font-medium text-[11px]">Turnover: ₹{totalWageredRupees.toFixed(0)}</span>
            </div>
          </Card>

          {/* Card 2: Customers / Active Players */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <Badge variant="neutral">
                  PostgreSQL
                </Badge>
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Total Players
                  <HelpCircle className="h-3 w-3 text-zinc-600" />
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {users.totalUsers || 0}
                  </span>
                  {/* Decorative neon blue wave */}
                  <svg className="w-16 h-8 stroke-sky-400 fill-none" viewBox="0 0 100 40">
                    <path
                      d="M 5,25 Q 35,5 60,20 T 95,8"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
                <ArrowUpRight className="h-3 w-3" />
                {users.activeUsers || 0} Active
              </span>
              <span className="text-zinc-500 font-medium text-[11px]">{users.bannedUsers || 0} Blocked</span>
            </div>
          </Card>

          {/* Card 3: Player Wallet Liquidity */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 border border-white/[0.08] text-purple-400">
                  <Wallet className="h-4 w-4" />
                </div>
                <Badge variant="neutral">
                  3 Buckets
                </Badge>
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Player Balances
                  <HelpCircle className="h-3 w-3 text-zinc-600" />
                </span>
                <div className="mt-1">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {formatRupees(totalAvailableRupees)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Dep: <strong className="text-zinc-200">₹{totalDepositRupees.toFixed(0)}</strong></span>
              <span>Win: <strong className="text-emerald-400">₹{totalWinningRupees.toFixed(0)}</strong></span>
              <span>Bonus: <strong className="text-zinc-200">₹{totalBonusRupees.toFixed(0)}</strong></span>
            </div>
          </Card>

          {/* Card 4: Action Required / Pending Payouts */}
          <Card 
            variant={pendingPayoutsCount > 0 ? 'urgent' : 'default'} 
            className="flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-md ${
                  pendingPayoutsCount > 0 ? 'bg-amber-950/60 border border-amber-800/40 text-amber-400' : 'bg-zinc-900 border border-white/[0.08] text-emerald-400'
                }`}>
                  {pendingPayoutsCount > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400 animate-pulse" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                {pendingPayoutsCount > 0 ? (
                  <Badge variant="peach">
                    Needs Action
                  </Badge>
                ) : (
                  <Badge variant="mint">
                    All Settled
                  </Badge>
                )}
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  Payout Queue
                  <HelpCircle className="h-3 w-3 text-zinc-600" />
                </span>
                <div className="mt-1">
                  <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    pendingPayoutsCount > 0 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {pendingPayoutsCount} Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px]">
                Total: <strong className="text-zinc-200 font-semibold">₹{pendingWithdrawRupees.toFixed(2)}</strong>
              </span>
              <span className={pendingPayoutsCount > 0 ? 'text-amber-400 font-medium text-[11px]' : 'text-emerald-400 font-medium text-[11px]'}>
                {pendingPayoutsCount > 0 ? 'Review UPI' : 'Cleared'}
              </span>
            </div>
          </Card>

        </div>
      </div>

      {/* Live Engine Runtime Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0c0c0e] border border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-black shadow-sm shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-xs">Ring of Future Game Engine</h3>
              <Badge variant="mint">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                {games.engineState?.state || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Round #{games.totalRoundsPlayed || 0} • Phase Time Left: <strong className="text-white font-bold">{games.engineState?.timeLeft || 0}s</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 text-xs text-zinc-300 font-normal">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Bet Bounds</span>
            <span className="text-white font-medium">₹{games.rtpConfig?.minBetRupees || 10} - ₹{games.rtpConfig?.maxBetRupees || 10000}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Deposits</span>
            <span className="text-emerald-400 font-medium">₹{approvedDepositRupees.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">Payouts</span>
            <span className="text-sky-400 font-medium">₹{approvedWithdrawRupees.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      {/* Product Activity / Ledger Stream Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 tracking-tight uppercase font-mono text-[11px]">
              Authoritative Ledger Stream
            </h2>
            <p className="text-[11px] text-zinc-500">Real-time immutable wallet transaction entries</p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
        </div>

        <Card className="overflow-hidden p-0 border border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#141417]/70 border-b border-white/[0.08] text-zinc-400 text-[11px] font-medium uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-5">Transaction ID</th>
                  <th className="py-3 px-5">Player</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Bucket</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-right">Balance After</th>
                  <th className="py-3 px-5">Notes / Ref</th>
                  <th className="py-3 px-5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-zinc-500 text-xs">
                      No transaction entries recorded in this time period.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((tx: any) => {
                    const amountRupees = Number(tx.amount || 0) / 100;
                    const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                    const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                    return (
                      <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 px-5 text-zinc-300 font-mono text-xs">
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

                        <td className="py-3 px-5 font-medium text-white text-xs">
                          <span className="truncate max-w-[120px] block" title={tx.user_name || tx.user_id}>
                            {tx.user_name || tx.user_id}
                          </span>
                        </td>

                        <td className="py-3 px-5">
                          {getTransactionBadge(tx.transaction_type)}
                        </td>

                        <td className="py-3 px-5 text-[11px] text-zinc-400 uppercase font-mono">
                          {tx.bucket}
                        </td>

                        <td className={`py-3 px-5 text-right font-semibold text-xs ${
                          isCredit ? 'text-emerald-400' : 'text-zinc-200'
                        }`}>
                          {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                        </td>

                        <td className="py-3 px-5 text-right font-medium text-zinc-200 text-xs font-mono">
                          ₹{balanceAfterRupees.toFixed(2)}
                        </td>

                        <td className="py-3 px-5 text-[11px] text-zinc-500 truncate max-w-[140px]" title={tx.description || tx.reference_id}>
                          {tx.description || tx.reference_id || '—'}
                        </td>

                        <td className="py-3 px-5 text-[11px] text-zinc-500 whitespace-nowrap">
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
