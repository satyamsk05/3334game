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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Platform Analytics & Telemetry</h1>
            <Badge variant="info">Aggregated Metrics</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Statistical performance indicators, player turnover and financial margins</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center rounded-md border border-border-default bg-surface-raised p-0.5 text-xs font-medium text-text-secondary">
          {(['24h', '7d', '30d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`rounded px-2.5 py-1 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                range === t ? 'text-text-primary bg-surface-subtle font-semibold shadow-sm' : 'hover:text-text-primary'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-text-tertiary">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-primary mb-2" />
          <span>Crunching PostgreSQL analytics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1: Financial & GGR Overview */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-status-positive" />
              <span>Gross Gaming Revenue & Performance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Total Wagered Turnover</span>
                <div className="mt-2 text-2xl font-bold font-mono text-text-primary">
                  ₹{totalWagered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">{games.totalBetsPlaced || 0} bets placed in range</p>
              </Card>

              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Total Won / Payouts</span>
                <div className="mt-2 text-2xl font-bold font-mono text-status-positive">
                  ₹{totalWon.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Disbursed win credits</p>
              </Card>

              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Gross Gaming Revenue (GGR)</span>
                <div className={`mt-2 text-2xl font-bold font-mono ${ggr >= 0 ? 'text-status-positive' : 'text-status-negative'}`}>
                  ₹{ggr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Turnover minus player wins</p>
              </Card>
            </div>
          </div>

          {/* Section 2: RTP & Fairness Health */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-primary" />
                <h3 className="text-sm font-semibold text-text-primary">RTP Compliance & Game Math Verification</h3>
              </div>
              <Badge variant="positive">95.0% Invariant Target</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-mono">
              <div>
                <span className="text-text-tertiary block text-[11px] uppercase font-sans">Engine Target RTP</span>
                <span className="text-text-primary text-base font-bold">
                  {games.rtpConfig?.targetPercent || '95.0'}%
                </span>
                <span className="text-[11px] text-text-tertiary block mt-0.5 font-sans">Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x</span>
              </div>

              <div>
                <span className="text-text-tertiary block text-[11px] uppercase font-sans">Actual Observed RTP</span>
                <span className={`text-base font-bold ${Math.abs(rtpActual - 95) <= 3 ? 'text-status-positive' : 'text-status-warning'}`}>
                  {rtpActual.toFixed(2)}%
                </span>
                <span className="text-[11px] text-text-tertiary block mt-0.5 font-sans">Derived from PostgreSQL bets table</span>
              </div>

              <div>
                <span className="text-text-tertiary block text-[11px] uppercase font-sans">Total Engine Rounds</span>
                <span className="text-text-primary text-base font-bold">
                  #{games.totalRoundsPlayed || 0}
                </span>
                <span className="text-[11px] text-text-tertiary block mt-0.5 font-sans">Authoritative server rounds</span>
              </div>
            </div>
          </Card>

          {/* Section 3: Cash Inflow vs Outflow */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent-primary" />
              <span>Cash Flow & Liquidity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Settled Deposits (In)</span>
                <div className="mt-2 text-2xl font-bold font-mono text-status-positive">
                  ₹{totalDeposited.toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">UPI & manual deposit credits</p>
              </Card>

              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Settled Withdrawals (Out)</span>
                <div className="mt-2 text-2xl font-bold font-mono text-status-negative">
                  ₹{totalWithdrawn.toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Processed player payouts</p>
              </Card>

              <Card>
                <span className="text-xs font-mono text-text-tertiary uppercase">Net Cash Flow</span>
                <div className={`mt-2 text-2xl font-bold font-mono ${netFinancial >= 0 ? 'text-status-positive' : 'text-status-negative'}`}>
                  ₹{netFinancial.toFixed(2)}
                </div>
                <p className="mt-1 text-xs text-text-tertiary">Deposits minus withdrawals</p>
              </Card>
            </div>
          </div>

          {/* Section 4: Player Community Demographics */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Users className="h-4 w-4 text-accent-primary" />
              <span>Player Retention & Account Health</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-md bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Registered Total</span>
                <span className="text-text-primary text-base font-bold">{users.totalUsers || 0}</span>
              </div>
              <div className="p-3 rounded-md bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Active Accounts</span>
                <span className="text-status-positive text-base font-bold">{users.activeUsers || 0}</span>
              </div>
              <div className="p-3 rounded-md bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Banned / Suspended</span>
                <span className="text-status-negative text-base font-bold">{users.bannedUsers || 0}</span>
              </div>
              <div className="p-3 rounded-md bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">New in Period</span>
                <span className="text-accent-primary text-base font-bold">+{users.newUsers || 0}</span>
              </div>
            </div>
          </Card>

        </div>
      )}

    </div>
  );
}
