'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Coins,
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchLiveMetrics = async (selectedRange: string = range) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats(selectedRange);
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err: any) {
      console.error('Metrics sync error:', err);
      setError(err.response?.data?.message || err.message || 'Telemetry connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics(range);
  }, [range]);

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
  const totalWonRupees = Number(games.totalWonPaise || 0) / 100;
  const ggrRupees = Number(games.ggrPaise || 0) / 100;
  const hasBets = games.totalBetsPlaced > 0;

  const approvedDepositRupees = Number(deposits.approvedAmountPaise || 0) / 100;
  const pendingDepositRupees = Number(deposits.pendingAmountPaise || 0) / 100;
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
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Platform overview
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Authoritative financial telemetry & real-time gaming engine operations
          </p>
        </div>

        {/* Date Filters & Sync Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-2xl bg-white p-1 shadow-sm border border-gray-200/80 text-xs font-semibold text-gray-600">
            {(['24h', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`rounded-xl px-3.5 py-1.5 transition-fast ${
                  range === t
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'hover:text-gray-900 hover:bg-gray-50'
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
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-accent-primary' : 'text-gray-500'}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards (Dribbble/Reference Image Style) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: GGR / Earnings */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff6ff] text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <Badge variant="mint">
                  Live Engine
                </Badge>
              </div>

              <div className="mt-5">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  Gaming Revenue
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {formatRupees(ggrRupees)}
                  </span>
                  {/* Decorative smooth sparkline */}
                  <svg className="w-20 h-10 stroke-emerald-500 fill-none" viewBox="0 0 100 40">
                    <path
                      d="M 5,30 Q 30,38 50,15 T 95,10"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 font-semibold">
                <ArrowUpRight className="h-3 w-3" />
                95.0% Target RTP
              </span>
              <span className="text-gray-400 font-medium">Turnover: ₹{totalWageredRupees.toFixed(0)}</span>
            </div>
          </Card>

          {/* Card 2: Customers / Active Players */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecfdf5] text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="neutral">
                  PostgreSQL
                </Badge>
              </div>

              <div className="mt-5">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  Total Players
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {users.totalUsers || 0}
                  </span>
                  {/* Decorative smooth wave */}
                  <svg className="w-20 h-10 stroke-blue-500 fill-none" viewBox="0 0 100 40">
                    <path
                      d="M 5,25 Q 35,5 60,20 T 95,8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 font-semibold">
                <ArrowUpRight className="h-3 w-3" />
                {users.activeUsers || 0} Active Now
              </span>
              <span className="text-gray-400 font-medium">{users.bannedUsers || 0} Suspended</span>
            </div>
          </Card>

          {/* Card 3: Player Wallet Liquidity */}
          <Card className="flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f3ff] text-purple-600">
                  <Wallet className="h-6 w-6" />
                </div>
                <Badge variant="neutral">
                  3 Buckets
                </Badge>
              </div>

              <div className="mt-5">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  Player Balances
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <div className="mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                    {formatRupees(totalAvailableRupees)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Dep: <strong className="text-gray-800">₹{totalDepositRupees.toFixed(0)}</strong></span>
              <span>Win: <strong className="text-emerald-600">₹{totalWinningRupees.toFixed(0)}</strong></span>
              <span>Bonus: <strong className="text-gray-800">₹{totalBonusRupees.toFixed(0)}</strong></span>
            </div>
          </Card>

          {/* Card 4: Action Required / Pending Payouts */}
          <Card 
            variant={pendingPayoutsCount > 0 ? 'urgent' : 'default'} 
            className="flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  pendingPayoutsCount > 0 ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pendingPayoutsCount > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-orange-500 animate-pulse" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
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

              <div className="mt-5">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  Payout Queue
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                </span>
                <div className="mt-2">
                  <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    pendingPayoutsCount > 0 ? 'text-orange-600' : 'text-gray-900'
                  }`}>
                    {pendingPayoutsCount} Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Amount: <strong className="text-gray-900 font-semibold">₹{pendingWithdrawRupees.toFixed(2)}</strong>
              </span>
              <span className={pendingPayoutsCount > 0 ? 'text-orange-600 font-bold' : 'text-emerald-600 font-semibold'}>
                {pendingPayoutsCount > 0 ? 'Review UPI Payout' : 'Cleared'}
              </span>
            </div>
          </Card>

        </div>
      </div>

      {/* Live Engine Runtime Status Banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/30 border border-blue-100/60">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Authoritative Game Engine: Ring of Future</h3>
              <Badge variant="mint">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                {games.engineState?.state || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Round #{games.totalRoundsPlayed || 0} • Phase Time Remaining: <strong className="text-blue-600 font-bold">{games.engineState?.timeLeft || 0}s</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-600 font-medium">
          <div>
            <span className="text-gray-400 block text-[11px]">Bet Bounds</span>
            <span className="text-gray-900 font-bold">₹{games.rtpConfig?.minBetRupees || 10} - ₹{games.rtpConfig?.maxBetRupees || 10000}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Settled Deposits</span>
            <span className="text-emerald-600 font-bold">₹{approvedDepositRupees.toFixed(0)}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[11px]">Disbursed Payouts</span>
            <span className="text-blue-600 font-bold">₹{approvedWithdrawRupees.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      {/* Product Activity / Ledger Stream Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product activity</h2>
            <p className="text-xs text-gray-500 mt-0.5">Authoritative real-time wallet ledger audit stream</p>
          </div>
          {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-[#f9fafb] border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Player</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Bucket</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-right">Balance After</th>
                  <th className="py-3.5 px-6">Notes / Ref</th>
                  <th className="py-3.5 px-6">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                      No transaction entries recorded in this time period.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((tx: any) => {
                    const amountRupees = Number(tx.amount || 0) / 100;
                    const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                    const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50/70 transition-fast">
                        <td className="py-3.5 px-6 text-gray-900 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[110px]" title={tx.id}>
                              {tx.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(tx.id)}
                              className="text-gray-400 hover:text-gray-700 p-1 rounded-md transition-fast"
                              aria-label={`Copy transaction ID ${tx.id}`}
                            >
                              {copiedId === tx.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 font-semibold text-gray-900 text-xs">
                          <span className="truncate max-w-[120px] block" title={tx.user_name || tx.user_id}>
                            {tx.user_name || tx.user_id}
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          {getTransactionBadge(tx.transaction_type)}
                        </td>

                        <td className="py-3.5 px-6 text-xs text-gray-500 uppercase font-medium">
                          {tx.bucket}
                        </td>

                        <td className={`py-3.5 px-6 text-right font-bold text-xs ${
                          isCredit ? 'text-emerald-600' : 'text-gray-900'
                        }`}>
                          {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-6 text-right font-bold text-gray-900 text-xs">
                          ₹{balanceAfterRupees.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-6 text-xs text-gray-400 truncate max-w-[140px]" title={tx.description || tx.reference_id}>
                          {tx.description || tx.reference_id || '—'}
                        </td>

                        <td className="py-3.5 px-6 text-xs text-gray-400 whitespace-nowrap">
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
