'use client';
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Loader2, 
  ShieldCheck
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AnalyticsPage() {
  const [range, setRange] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDashboardStats(range);
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || 'Failed to load platform analytics');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Telemetry connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  const users = stats?.users || {};
  const deposits = stats?.deposits || {};
  const withdrawals = stats?.withdrawals || {};
  const games = stats?.games || {};

  const totalWagered = Number(games.totalWageredPaise || 0) / 100;
  const totalWon = Number(games.totalWonPaise || 0) / 100;
  const ggr = Number(games.ggrPaise || 0) / 100;
  const rtpActual = totalWagered > 0 ? (totalWon / totalWagered) * 100 : 95.0;

  const totalDeposited = Number(deposits.approvedAmountPaise || 0) / 100;
  const totalWithdrawn = Number(withdrawals.approvedAmountPaise || 0) / 100;
  const netFinancial = totalDeposited - totalWithdrawn;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Platform Analytics & Telemetry</h1>
            <Badge variant="info">Aggregated Metrics</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">Statistical performance indicators, player turnover and financial margins</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center rounded-lg border border-border-default bg-surface-raised p-1 text-xs font-medium text-text-secondary shadow-xs">
          {(['24h', '7d', '30d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`rounded-md px-3 py-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                range === t ? 'text-text-primary bg-surface-strong font-semibold shadow-xs' : 'hover:text-text-primary'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-text-tertiary">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-accent-primary mb-3" />
          <span className="text-sm">Crunching PostgreSQL analytics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1: Financial & GGR Overview */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>Gross Gaming Revenue & Performance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Total Wagered Turnover</span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-text-primary tabular-nums">
                  ₹{totalWagered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">{games.totalBetsPlaced || 0} bets placed in range</p>
              </Card>

              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Total Won / Payouts</span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{totalWon.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">Disbursed win credits</p>
              </Card>

              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Gross Gaming Revenue (GGR)</span>
                <div className={`mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums ${ggr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{ggr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">Turnover minus player wins</p>
              </Card>
            </div>
          </div>

          {/* Section 2: RTP & Fairness Health */}
          <Card className="rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-primary" />
                <h3 className="text-base font-semibold text-text-primary">RTP Compliance & Game Math Verification</h3>
              </div>
              <Badge variant="positive">95.0% Invariant Target</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-mono">
              <div>
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Engine Target RTP</span>
                <span className="text-text-primary text-lg font-bold">
                  {games.rtpConfig?.targetPercent || '95.0'}%
                </span>
                <span className="text-xs text-text-tertiary block mt-1 font-sans">Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x</span>
              </div>

              <div>
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Actual Observed RTP</span>
                <span className={`text-lg font-bold ${Math.abs(rtpActual - 95) <= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {rtpActual.toFixed(2)}%
                </span>
                <span className="text-xs text-text-tertiary block mt-1 font-sans">Derived from PostgreSQL bets table</span>
              </div>

              <div>
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Total Engine Rounds</span>
                <span className="text-text-primary text-lg font-bold">
                  #{games.totalRoundsPlayed || 0}
                </span>
                <span className="text-xs text-text-tertiary block mt-1 font-sans">Authoritative server rounds</span>
              </div>
            </div>
          </Card>

          {/* Section 3: Cash Inflow vs Outflow */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent-primary" />
              <span>Cash Flow & Liquidity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Settled Deposits (In)</span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  ₹{totalDeposited.toFixed(2)}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">UPI & manual deposit credits</p>
              </Card>

              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Settled Withdrawals (Out)</span>
                <div className="mt-2 text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  ₹{totalWithdrawn.toFixed(2)}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">Processed player payouts</p>
              </Card>

              <Card className="rounded-xl p-5">
                <span className="text-xs font-mono text-text-tertiary uppercase tracking-wider">Net Cash Flow</span>
                <div className={`mt-2 text-2xl sm:text-3xl font-bold font-mono tabular-nums ${netFinancial >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{netFinancial.toFixed(2)}
                </div>
                <p className="mt-1.5 text-xs text-text-tertiary">Deposits minus withdrawals</p>
              </Card>
            </div>
          </div>

          {/* Section 4: Player Community Demographics */}
          <Card className="rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-primary" />
              <span>Player Retention & Account Health</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-surface-strong/60 border border-border-subtle">
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Registered Total</span>
                <span className="text-text-primary text-xl font-bold block mt-1 tabular-nums">{users.totalUsers || 0}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-strong/60 border border-border-subtle">
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Active Accounts</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold block mt-1 tabular-nums">{users.activeUsers || 0}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-strong/60 border border-border-subtle">
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">Banned / Suspended</span>
                <span className="text-rose-600 dark:text-rose-400 text-xl font-bold block mt-1 tabular-nums">{users.bannedUsers || 0}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-surface-strong/60 border border-border-subtle">
                <span className="text-text-tertiary block text-xs uppercase font-sans tracking-wider">New in Period</span>
                <span className="text-accent-primary text-xl font-bold block mt-1 tabular-nums">+{users.newUsers || 0}</span>
              </div>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}
