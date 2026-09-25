'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Filter, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Coins,
  Activity,
  AlertCircle,
  AlertTriangle,
  Clock
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

  // Accessible format mapping for transaction types
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
        return <Badge variant="warning" ariaLabel="Withdrawal on hold transaction">Pending Payout</Badge>;
      case 'WITHDRAWAL_SETTLE':
        return <Badge variant="neutral" ariaLabel="Settled withdrawal transaction">Withdrawal</Badge>;
      case 'WITHDRAWAL_REVERT':
        return <Badge variant="positive" ariaLabel="Reverted withdrawal transaction">Reverted</Badge>;
      case 'ADMIN_CREDIT':
        return <Badge variant="positive" ariaLabel="Administrative credit transaction">Admin Credit</Badge>;
      case 'ADMIN_DEBIT':
        return <Badge variant="negative" ariaLabel="Administrative debit transaction">Admin Debit</Badge>;
      case 'PROMO_BONUS':
        return <Badge variant="info" ariaLabel="Promotional bonus transaction">Promo Bonus</Badge>;
      default:
        return <Badge variant="neutral" ariaLabel={`${txType} transaction`}>{txType}</Badge>;
    }
  };

  return (
    <div className="space-y-space-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col gap-space-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-space-5">
        <div>
          <div className="flex items-center gap-space-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Studio Telemetry</h1>
            <Badge variant="positive" ariaLabel="Status: Live Direct Connected">
              <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse" aria-hidden="true" />
              Live Direct
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-space-1">
            Authoritative PostgreSQL financial ledger and runtime telemetry
          </p>
        </div>

        {/* Date Filter Segmented Controls & Refresh */}
        <div className="flex items-center gap-space-2">
          <div 
            role="group" 
            aria-label="Select Telemetry Date Range"
            className="flex items-center rounded-xs border border-border-default bg-surface-raised p-space-1 text-xs text-text-secondary"
          >
            {(['24h', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                aria-pressed={range === t}
                className={`rounded-xs px-space-3 py-1 font-mono transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                  range === t
                    ? 'text-text-primary bg-border-default font-semibold shadow-sm'
                    : 'hover:text-text-primary text-text-secondary'
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
            loading={loading}
            icon={<Filter className="h-3.5 w-3.5 text-text-secondary" aria-hidden="true" />}
            aria-label="Synchronize telemetry data"
          >
            Sync
          </Button>
        </div>
      </div>

      {error && (
        <div 
          role="alert" 
          className="flex items-center gap-space-2 rounded-md border border-status-negative/30 bg-status-negative/10 p-space-4 text-xs text-status-negative"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Grid (Top 4 Cards with Visual Hierarchy for Operator Actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-4">
        
        {/* Card 1: Player Balance Reserves */}
        <Card variant="default">
          <div className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider">
            <span>Player Balances</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              <Coins className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-space-3 flex items-baseline gap-space-2">
            <span className="text-xl font-semibold tracking-tight text-text-primary font-mono">
              ₹{totalAvailableRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-space-2 text-xs text-text-secondary space-y-space-1">
            <div className="flex justify-between">
              <span>Deposit:</span>
              <span className="text-text-primary font-mono">₹{totalDepositRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Winnings:</span>
              <span className="text-text-primary font-mono">₹{totalWinningRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus:</span>
              <span className="text-text-primary font-mono">₹{totalBonusRupees.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Gross Gaming Revenue (GGR) */}
        <Card variant="default">
          <div className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider">
            <span>Gross Gaming Revenue</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-status-positive/10 text-status-positive border border-status-positive/20">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-space-3 flex items-baseline gap-space-2">
            <span className={`text-xl font-semibold tracking-tight font-mono ${ggrRupees >= 0 ? 'text-status-positive' : 'text-status-negative'}`}>
              ₹{ggrRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-space-2 text-xs text-text-secondary space-y-space-1">
            {hasBets ? (
              <>
                <div className="flex justify-between">
                  <span>Total Bets:</span>
                  <span className="text-text-primary font-mono">₹{totalWageredRupees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payouts:</span>
                  <span className="text-text-primary font-mono">₹{totalWonRupees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Calculated RTP:</span>
                  <span className="text-accent-primary font-semibold font-mono">
                    {totalWageredRupees > 0 ? ((totalWonRupees / totalWageredRupees) * 100).toFixed(2) : '95.00'}%
                  </span>
                </div>
              </>
            ) : (
              <div className="pt-space-2 text-xs text-text-secondary italic">
                No wagering activity in range
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Settled Deposits */}
        <Card variant="default">
          <div className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider">
            <span>Settled Deposits</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-status-positive/10 text-status-positive border border-status-positive/20">
              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-space-3 flex items-baseline gap-space-2">
            <span className="text-xl font-semibold tracking-tight text-text-primary font-mono">
              ₹{approvedDepositRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-space-2 text-xs text-text-secondary space-y-space-1">
            <div className="flex justify-between">
              <span>Pending Queue:</span>
              <span className={`font-mono ${deposits.pendingCount > 0 ? 'text-status-warning font-semibold' : 'text-text-primary'}`}>
                {deposits.pendingCount || 0} req (₹{pendingDepositRupees.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Settlement:</span>
              <span className="text-status-positive">100% On-chain / UPI</span>
            </div>
          </div>
        </Card>

        {/* Card 4: URGENT OPERATOR ACTION — Pending Payouts & Queue */}
        <Card variant={pendingPayoutsCount > 0 ? 'urgent' : 'default'}>
          <div className="flex items-center justify-between text-text-secondary text-xs uppercase tracking-wider">
            <span>Action Required</span>
            <div className={`flex h-6 w-6 items-center justify-center rounded-xs ${
              pendingPayoutsCount > 0 
                ? 'bg-status-warning/15 text-status-warning border border-status-warning/40 animate-pulse'
                : 'bg-status-positive/10 text-status-positive border border-status-positive/20'
            }`}>
              {pendingPayoutsCount > 0 ? (
                <AlertTriangle className="h-3.5 w-3.5 text-status-warning" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-status-positive" aria-hidden="true" />
              )}
            </div>
          </div>
          <div className="mt-space-3 flex items-baseline gap-space-2">
            <span className={`text-xl font-semibold tracking-tight font-mono ${
              pendingPayoutsCount > 0 ? 'text-status-warning' : 'text-text-primary'
            }`}>
              {pendingPayoutsCount} Pending
            </span>
          </div>
          <div className="mt-space-2 text-xs text-text-secondary space-y-space-1">
            <div className="flex justify-between">
              <span>Payout Volume:</span>
              <span className="text-text-primary font-mono font-semibold">₹{pendingWithdrawRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Operator Duty:</span>
              <span className={pendingPayoutsCount > 0 ? 'text-status-warning font-medium' : 'text-status-positive'}>
                {pendingPayoutsCount > 0 ? 'Needs UPI Review' : 'Queue Cleared'}
              </span>
            </div>
          </div>
        </Card>

      </div>

      {/* Secondary Row: Game Engine Telemetry & Player Summary */}
      <Card variant="default">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-3 border-b border-border-muted pb-space-3 mb-space-3">
          <div className="flex items-center gap-space-2">
            <Activity className="h-4 w-4 text-accent-primary" aria-hidden="true" />
            <h2 className="text-sm font-medium text-text-primary">Authoritative Engine Telemetry — Ring of Future</h2>
          </div>
          <div className="flex items-center gap-space-3 text-xs text-text-secondary">
            <span>Engine State: <strong className="text-status-positive uppercase">{games.engineState?.state || 'ACTIVE'}</strong></span>
            <span className="text-border-default" aria-hidden="true">|</span>
            <span>Round #{games.totalRoundsPlayed || 0}</span>
            <span className="text-border-default" aria-hidden="true">|</span>
            <span>Time Left: <strong className="text-text-primary">{games.engineState?.timeLeft || 0}s</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-4 text-xs">
          <div>
            <span className="text-text-secondary block text-xs uppercase">RTP Target</span>
            <span className="text-text-primary font-semibold font-mono">{games.rtpConfig?.targetPercent || '95.0'}%</span>
          </div>
          <div>
            <span className="text-text-secondary block text-xs uppercase">Bet Min / Max</span>
            <span className="text-text-primary font-semibold font-mono">₹{games.rtpConfig?.minBetRupees || 10} - ₹{games.rtpConfig?.maxBetRupees || 10000}</span>
          </div>
          <div>
            <span className="text-text-secondary block text-xs uppercase">Total Players</span>
            <span className="text-text-primary font-semibold font-mono">{users.totalUsers || 0} ({users.activeUsers || 0} Active)</span>
          </div>
          <div>
            <span className="text-text-secondary block text-xs uppercase">Approved Payouts</span>
            <span className="text-status-positive font-semibold font-mono">₹{approvedWithdrawRupees.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Live Immutable Ledger Stream Table */}
      <div className="space-y-space-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-text-primary">Live Authoritative Ledger Stream</h2>
            <p className="text-xs text-text-secondary">
              Real-time transactional audit stream directly from PostgreSQL wallet_ledger
            </p>
          </div>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-accent-primary" aria-label="Loading updates" />}
        </div>

        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-3">Ledger ID</th>
                <th className="px-space-4 py-space-3">User</th>
                <th className="px-space-4 py-space-3">Type</th>
                <th className="px-space-4 py-space-3">Bucket</th>
                <th className="px-space-4 py-space-3 text-right">Amount</th>
                <th className="px-space-4 py-space-3 text-right">Balance After</th>
                <th className="px-space-4 py-space-3">Reference / Notes</th>
                <th className="px-space-4 py-space-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-space-4 py-space-8 text-center text-text-secondary">
                    No transactions recorded in the selected time range.
                  </td>
                </tr>
              ) : (
                recentActivity.map((tx: any) => {
                  const amountRupees = Number(tx.amount || 0) / 100;
                  const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                  const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                  return (
                    <tr key={tx.id} className="hover:bg-surface-muted/60 transition-fast">
                      {/* Truncated Ledger ID with Copy Icon */}
                      <td className="px-space-4 py-space-2.5 text-text-primary">
                        <div className="flex items-center gap-space-1.5">
                          <span className="truncate max-w-[110px] font-mono" title={tx.id}>
                            {tx.id}
                          </span>
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

                      {/* User Display */}
                      <td className="px-space-4 py-space-2.5 text-text-primary">
                        <span className="truncate max-w-[120px] block" title={tx.user_name || tx.user_id}>
                          {tx.user_name || tx.user_id}
                        </span>
                      </td>

                      {/* Visible Labeled TYPE Column */}
                      <td className="px-space-4 py-space-2.5 font-sans">
                        {getTransactionBadge(tx.transaction_type)}
                      </td>

                      {/* Bucket */}
                      <td className="px-space-4 py-space-2.5 text-text-secondary uppercase text-xs">
                        {tx.bucket}
                      </td>

                      {/* Amount with Strict Color Semantics */}
                      <td className={`px-space-4 py-space-2.5 text-right font-semibold ${
                        isCredit ? 'text-status-positive' : 'text-text-primary'
                      }`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                      </td>

                      {/* Balance After */}
                      <td className="px-space-4 py-space-2.5 text-right text-text-primary font-semibold">
                        ₹{balanceAfterRupees.toFixed(2)}
                      </td>

                      {/* Reference */}
                      <td className="px-space-4 py-space-2.5 text-text-secondary truncate max-w-[140px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '—'}
                      </td>

                      {/* Timestamp (text.tertiary for metadata only) */}
                      <td className="px-space-4 py-space-2.5 text-text-tertiary whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
