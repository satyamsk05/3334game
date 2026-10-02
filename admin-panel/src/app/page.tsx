'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
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
  RefreshCw,
  Wallet,
  Gamepad2,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VerticalBarChart } from '@/components/charts/VerticalBarChart';
import { DonutProgressRing } from '@/components/charts/DonutProgressRing';
import { MultiLineSplineChart } from '@/components/charts/MultiLineSplineChart';

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
      activeRequestRef.current++;
    };
  }, [range, fetchLiveMetrics]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const users = stats?.users || {};
  const wallet = stats?.financials || stats?.wallet || {};
  const deposits = stats?.deposits || stats?.financials || {};
  const withdrawals = stats?.withdrawals || stats?.financials || {};
  const games = stats?.games || {};
  const recentActivity = stats?.recentActivity || [];

  const totalDepositRupees = Number(wallet.totalDepositPaise ?? 0) / 100;
  const totalWinningRupees = Number(wallet.totalWinningPaise ?? 0) / 100;
  const totalBonusRupees = Number(wallet.totalBonusPaise ?? 0) / 100;
  const totalAvailableRupees = Number(wallet.totalAvailablePaise ?? 0) / 100;

  const totalWageredRupees = Number(games.totalWageredPaise ?? 0) / 100;
  const totalPayoutsRupees = Number(games.totalPayoutsPaise ?? 0) / 100;
  const ggrRupees = Number(
    games.ggrPaise ?? (games.totalWageredPaise ? Math.max(0, Number(games.totalWageredPaise) - Number(games.totalPayoutsPaise || 0)) : 0)
  ) / 100;

  const approvedDepositRupees = Number(deposits.approvedAmountPaise ?? deposits.approvedDepositsPaise ?? 0) / 100;
  const approvedWithdrawRupees = Number(withdrawals.approvedAmountPaise ?? withdrawals.approvedWithdrawalsPaise ?? 0) / 100;
  const pendingWithdrawRupees = Number(withdrawals.pendingAmountPaise ?? withdrawals.pendingWithdrawalsPaise ?? 0) / 100;
  const pendingPayoutsCount = Number(withdrawals.pendingCount ?? withdrawals.pendingWithdrawalsCount ?? 0);

  const activeUserCount = Number(users.active ?? users.activeUsers ?? 0);
  const totalUserCount = Math.max(Number(users.total ?? users.totalUsers ?? 0), 1);
  const bannedUserCount = Number(users.banned ?? users.bannedUsers ?? 0);
  const activePercentage = Math.round((activeUserCount / totalUserCount) * 100) || (stats ? 0 : 75);

  const formatRupees = (val: number) => {
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹ ${(val / 1000).toFixed(1)}k`;
    return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTransactionBadge = (txType: string) => {
    const norm = String(txType || '').toUpperCase();
    switch (norm) {
      case 'DEPOSIT':
        return <Badge variant="positive">Deposit</Badge>;
      case 'WIN_PAYOUT':
        return <Badge variant="positive">Win Payout</Badge>;
      case 'BET_REFUND':
        return <Badge variant="info">Refund</Badge>;
      case 'BET_DEBIT':
      case 'BET_PLACED':
      case 'BET':
        return <Badge variant="blue">Bet Debit</Badge>;
      case 'WITHDRAWAL_HOLD':
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'WITHDRAWAL_SETTLE':
        return <Badge variant="neutral">Paid Out</Badge>;
      case 'WITHDRAWAL_REVERT':
        return <Badge variant="positive">Reverted</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="positive">Credit</Badge>;
      case 'ADMIN_DEBIT':
        return <Badge variant="negative">Debit</Badge>;
      case 'PROMO_BONUS':
        return <Badge variant="mint">Promo Bonus</Badge>;
      default:
        return <Badge variant="neutral">{txType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar with Title, Range Filters, and Action Pill */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border-default">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Overview Statistics
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time analytics for Bit Arcade gaming platform, liquidity, and operations.
          </p>
        </div>

        {/* Right side controls: Date Filters + Add Game + Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector pill */}
          <div className="flex items-center rounded-xl bg-surface-strong p-1 border border-border-default text-xs font-medium text-text-secondary">
            {(['24h', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  range === t
                    ? 'bg-surface-raised text-text-primary shadow-xs font-semibold'
                    : 'hover:text-text-primary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* "+ Add Game" Primary Action Pill Button */}
          <Link href="/games">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              className="rounded-lg font-semibold shadow-xs"
            >
              Add Game
            </Button>
          </Link>

          {/* Sync Telemetry */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchLiveMetrics(range)}
            disabled={loading}
            aria-label="Refresh telemetry"
            className="rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-text-primary' : 'text-text-secondary'}`} strokeWidth={1.8} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-xs text-rose-600 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" strokeWidth={1.8} />
            <span>{error}</span>
          </div>
          {isNetwork && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => fetchLiveMetrics(range)}
              disabled={loading}
              className="self-start sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.8} />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* TOP ROW: 4 Minimalist Spline.one Style KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Projects / Games in Work (Green Bar Chart) */}
        <Card className="flex flex-col justify-between p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Gamepad2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span>Games in Work</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-text-primary tabular-nums">
                  {games.activeGames ?? 2}
                </span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>
            </div>

            {/* Vertical Pill Bar Micro Chart */}
            <div className="w-24">
              <VerticalBarChart data={[30, 60, 45, 90, 70, 85, 95]} color="emerald" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>Ring of Future • XO • TTT</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% online</span>
          </div>
        </Card>

        {/* Card 2: Tasks / Bets in Work (Blue Bar Chart) */}
        <Card className="flex flex-col justify-between p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                  <Activity className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span>Bets & Rounds</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-text-primary tabular-nums">
                  {games.totalRounds ?? games.totalRoundsPlayed ?? 0}
                </span>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Rounds
                </span>
              </div>
            </div>

            {/* Vertical Blue Bar Micro Chart */}
            <div className="w-24">
              <VerticalBarChart data={[40, 55, 75, 60, 85, 90, 100]} color="blue" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>Volume: <strong className="text-text-primary font-medium">₹{totalWageredRupees.toFixed(0)}</strong></span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{games.totalBets ?? 0} bets</span>
          </div>
        </Card>

        {/* Card 3: Members / Active Players (Donut Ring) */}
        <Card className="flex flex-col justify-between p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                  <Users className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span>Active Players</span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-3">
                <div>
                  <span className="text-2xl font-bold tracking-tight text-text-primary tabular-nums">
                    {activeUserCount}
                  </span>
                  <span className="text-xs text-text-tertiary block">In Play</span>
                </div>
                <span className="text-border-default text-xl">/</span>
                <div>
                  <span className="text-2xl font-bold tracking-tight text-text-secondary tabular-nums">
                    {Math.max(totalUserCount - activeUserCount, 0)}
                  </span>
                  <span className="text-xs text-text-tertiary block">In Lobby</span>
                </div>
              </div>
            </div>

            {/* Donut Progress Ring */}
            <DonutProgressRing percentage={activePercentage} size={50} color="#8B5CF6" />
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>Total: <strong className="text-text-primary font-medium">{totalUserCount}</strong></span>
            <span className="text-purple-600 dark:text-purple-400 font-medium">{bannedUserCount} banned</span>
          </div>
        </Card>

        {/* Card 4: Total Platform Profit / Revenue (Purple Accent) */}
        <Card className="flex flex-col justify-between p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs hover:shadow-sm transition-all">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  <Wallet className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                </div>
                <span>Platform Profit</span>
              </div>
              <div className="mt-2.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary tabular-nums">
                  {formatRupees(ggrRupees)}
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="h-4 w-4" />
              Margin
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span>RTP: <strong className="text-text-primary font-medium">95.0%</strong></span>
            <span>Player Balances: <strong className="text-text-primary font-medium">₹{totalAvailableRupees.toFixed(0)}</strong></span>
          </div>
        </Card>

      </div>

      {/* MID SECTION: Financial Flow Spline & Engine Workload Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Spline Chart: Deposits vs Payouts Over Time (2 Columns) */}
        <Card className="lg:col-span-2 p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Financial Flow
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Approved player deposits vs processed withdrawal payouts.
              </p>
            </div>

            {/* Legend Pills */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Deposits ({formatRupees(approvedDepositRupees)})
              </span>
              <span className="flex items-center gap-1.5 font-medium text-indigo-600 dark:text-indigo-400">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Payouts ({formatRupees(approvedWithdrawRupees)})
              </span>
            </div>
          </div>

          {/* Smooth Dual Spline Curve */}
          <div className="pt-2">
            <MultiLineSplineChart
              seriesA={[35, 52, 48, 70, 62, 85, 78, 92, 88, 100]}
              seriesB={[20, 30, 28, 45, 40, 58, 50, 65, 60, 72]}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle text-center text-xs">
            <div className="p-2 rounded-xl bg-surface-strong/50">
              <span className="text-text-tertiary block text-xs">Net Deposit Flow</span>
              <span className="font-semibold text-text-primary tabular-nums">₹{approvedDepositRupees.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-strong/50">
              <span className="text-text-tertiary block text-xs">Settled Payouts</span>
              <span className="font-semibold text-text-primary tabular-nums">₹{approvedWithdrawRupees.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-surface-strong/50">
              <span className="text-text-tertiary block text-xs">Platform Margin</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +₹{Math.max(approvedDepositRupees - approvedWithdrawRupees, 0).toFixed(0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Task & Action Queues (1 Column) */}
        <Card className="p-5 bg-surface-raised border border-border-default rounded-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">
                Task & Queue Statistics
              </h2>
              <span className="text-xs text-text-tertiary font-mono">Live</span>
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Current operational queues and settlement status.
            </p>

            {/* Status Breakdown Pills */}
            <div className="space-y-3 mt-4">
              
              {/* Payouts Queue */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-strong/60 border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${pendingPayoutsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      Withdrawal Queue
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {pendingPayoutsCount > 0 ? `${pendingPayoutsCount} pending approval` : 'All requests settled'}
                    </span>
                  </div>
                </div>
                <Link href="/payments/withdrawals">
                  <Button variant={pendingPayoutsCount > 0 ? 'primary' : 'outline'} size="sm" className="rounded-lg h-8 text-xs">
                    Review
                  </Button>
                </Link>
              </div>

              {/* Game Engine Round */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-strong/60 border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      Ring of Future
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Round #{games.totalRoundsPlayed || 1} • {games.engineState?.timeLeft || 15}s left
                    </span>
                  </div>
                </div>
                <Link href="/games">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs">
                    Manage
                  </Button>
                </Link>
              </div>

              {/* Player Support / KYC */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-strong/60 border border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      Verified KYC Status
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {users.totalUsers || 12} active player profiles
                    </span>
                  </div>
                </div>
                <Link href="/users">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs">
                    Inspect
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Audit engine active
            </span>
            <span className="text-text-tertiary font-mono">v2.4</span>
          </div>
        </Card>

      </div>

      {/* BOTTOM SECTION: Workload Table / Recent Activity Stream */}
      <Card className="p-0 bg-surface-raised border border-border-default rounded-xl shadow-xs overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-border-default gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">
              Recent Player Activity & Authoritative Ledger
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Real-time audit log of ledger debits, payouts, and deposit settlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/transactions/ledger">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                <span>View Full Ledger</span>
                <ExternalLink className="h-4 w-4 ml-1.5 text-text-tertiary" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Minimalist Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-secondary">
            <thead className="border-b border-border-subtle text-text-tertiary font-semibold uppercase tracking-wider text-xs bg-surface-strong/40">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-5 font-semibold">Player</th>
                <th className="py-3.5 px-5 font-semibold">Type</th>
                <th className="py-3.5 px-5 font-semibold">Bucket</th>
                <th className="py-3.5 px-5 text-right font-semibold">Amount</th>
                <th className="py-3.5 px-5 text-right font-semibold">Balance After</th>
                <th className="py-3.5 px-5 font-semibold">Reference</th>
                <th className="py-3.5 px-5 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-text-tertiary text-xs">
                    No transactions recorded for the selected interval.
                  </td>
                </tr>
              ) : (
                recentActivity.map((tx: any) => {
                  const amountRupees = Number(tx.amount || 0) / 100;
                  const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                  const txType = String(tx.transaction_type || tx.type || '').toUpperCase();
                  const isCredit = tx.direction === 'CREDIT' || ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(txType);

                  return (
                    <tr key={tx.id} className="hover:bg-surface-strong/50 transition-colors">
                      {/* ID with Copy Button */}
                      <td className="py-3.5 px-5 font-mono text-sm text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[110px]" title={tx.id}>
                            {tx.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.id)}
                            className="text-text-tertiary hover:text-text-primary p-0.5 rounded transition-colors"
                            aria-label={`Copy transaction ID ${tx.id}`}
                          >
                            {copiedId === tx.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Player Profile with Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-strong text-text-primary font-bold text-xs border border-border-default">
                            {String(tx.user_name || tx.user_id || 'U').slice(0, 1).toUpperCase()}
                          </div>
                          <span className="font-medium text-text-primary truncate max-w-[120px]" title={tx.user_name || tx.user_id}>
                            {tx.user_name || tx.user_id}
                          </span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-5">
                        {getTransactionBadge(txType)}
                      </td>

                      {/* Bucket */}
                      <td className="py-3.5 px-5 text-text-secondary capitalize">
                        {String(tx.bucket || '').toLowerCase()}
                      </td>

                      {/* Amount */}
                      <td className={`py-3.5 px-5 text-right font-semibold tabular-nums ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-primary'
                      }`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                      </td>

                      {/* Balance After */}
                      <td className="py-3.5 px-5 text-right font-mono text-text-secondary tabular-nums">
                        ₹{balanceAfterRupees.toFixed(2)}
                      </td>

                      {/* Reference Description */}
                      <td className="py-3.5 px-5 text-text-tertiary truncate max-w-[140px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '—'}
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-5 text-text-tertiary whitespace-nowrap">
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
  );
}
