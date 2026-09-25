'use client';
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  Coins, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Loader2, 
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '@/services/adminService';

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
  const wallet = stats?.wallet || {};
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Platform Analytics & Telemetry</h1>
            <span className="rounded-full bg-[#2988ff]/10 px-2 py-0.5 text-[10.5px] font-mono text-[#2988ff] border border-[#2988ff]/20">
              Aggregated Metrics
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Statistical performance indicators, player turnover and financial margins</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
          {(['24h', '7d', '30d', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setRange(t)}
              className={`rounded-[3px] px-2.5 py-1 transition-all ${
                range === t ? 'text-[#e1e1e1] bg-white/[0.08] font-semibold shadow-sm' : 'hover:text-[#e1e1e1]'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-[#8c8c8c]">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2988ff] mb-2" />
          <span>Crunching PostgreSQL analytics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Section 1: Financial & GGR Overview */}
          <div className="space-y-3">
            <h2 className="text-[13px] font-semibold text-[#e1e1e1] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Gross Gaming Revenue & Performance</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total Wagered Turnover</span>
                <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">
                  ₹{totalWagered.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">{games.totalBetsPlaced || 0} bets placed in range</p>
              </div>

              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total Won / Payouts</span>
                <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
                  ₹{totalWon.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">Disbursed win credits</p>
              </div>

              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Gross Gaming Revenue (GGR)</span>
                <div className={`mt-2 text-xl font-bold font-mono ${ggr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{ggr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">Turnover minus player wins</p>
              </div>
            </div>
          </div>

          {/* Section 2: RTP & Fairness Health */}
          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2988ff]" />
                <h3 className="text-[13px] font-semibold text-[#e1e1e1]">RTP Compliance & Game Math Verification</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">95.0% Invariant Target</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-[12px] font-mono">
              <div>
                <span className="text-[#8c8c8c] block text-[11px] uppercase">Engine Target RTP</span>
                <span className="text-[#e1e1e1] text-base font-bold">
                  {games.rtpConfig?.targetPercent || '95.0'}%
                </span>
                <span className="text-[10.5px] text-[#666] block mt-0.5">Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x</span>
              </div>

              <div>
                <span className="text-[#8c8c8c] block text-[11px] uppercase">Actual Observed RTP</span>
                <span className={`text-base font-bold ${Math.abs(rtpActual - 95) <= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {rtpActual.toFixed(2)}%
                </span>
                <span className="text-[10.5px] text-[#666] block mt-0.5">Derived from PostgreSQL bets table</span>
              </div>

              <div>
                <span className="text-[#8c8c8c] block text-[11px] uppercase">Total Engine Rounds</span>
                <span className="text-[#e1e1e1] text-base font-bold">
                  #{games.totalRoundsPlayed || 0}
                </span>
                <span className="text-[10.5px] text-[#666] block mt-0.5">Authoritative server rounds</span>
              </div>
            </div>
          </div>

          {/* Section 3: Cash Inflow vs Outflow */}
          <div className="space-y-3">
            <h2 className="text-[13px] font-semibold text-[#e1e1e1] flex items-center gap-2">
              <Coins className="h-4 w-4 text-[#2988ff]" />
              <span>Cash Flow & Liquidity</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Settled Deposits (In)</span>
                <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
                  ₹{totalDeposited.toFixed(2)}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">UPI & manual deposit credits</p>
              </div>

              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Settled Withdrawals (Out)</span>
                <div className="mt-2 text-xl font-bold font-mono text-rose-400">
                  ₹{totalWithdrawn.toFixed(2)}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">Processed player payouts</p>
              </div>

              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
                <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Net Cash Flow</span>
                <div className={`mt-2 text-xl font-bold font-mono ${netFinancial >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ₹{netFinancial.toFixed(2)}
                </div>
                <p className="mt-1 text-[11px] text-[#8c8c8c]">Deposits minus withdrawals</p>
              </div>
            </div>
          </div>

          {/* Section 4: Player Community Demographics */}
          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-[#e1e1e1] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#2988ff]" />
              <span>Player Retention & Account Health</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] font-mono">
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Registered Total</span>
                <span className="text-[#e1e1e1] text-base font-bold">{users.totalUsers || 0}</span>
              </div>
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Active Accounts</span>
                <span className="text-emerald-400 text-base font-bold">{users.activeUsers || 0}</span>
              </div>
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Banned / Suspended</span>
                <span className="text-rose-400 text-base font-bold">{users.bannedUsers || 0}</span>
              </div>
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10.5px] uppercase">New in Period</span>
                <span className="text-[#2988ff] text-base font-bold">+{users.newUsers || 0}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
