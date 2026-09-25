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
  AlertCircle
} from 'lucide-react';
import { adminService } from '@/services/adminService';

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

  const approvedDepositRupees = Number(deposits.approvedAmountPaise || 0) / 100;
  const pendingDepositRupees = Number(deposits.pendingAmountPaise || 0) / 100;
  const approvedWithdrawRupees = Number(withdrawals.approvedAmountPaise || 0) / 100;
  const pendingWithdrawRupees = Number(withdrawals.pendingAmountPaise || 0) / 100;

  return (
    <div className="space-y-6">
      
      {/* Studio Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Studio Telemetry</h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-mono text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Direct
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative PostgreSQL financial ledger and runtime telemetry</p>
        </div>

        {/* Date Filter Segmented Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
            {(['24h', '7d', '30d', 'all'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`rounded-[3px] px-2.5 py-1 transition-all ${
                  range === t
                    ? 'text-[#e1e1e1] bg-white/[0.08] font-semibold shadow-sm'
                    : 'hover:text-[#e1e1e1]'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <button 
            onClick={() => fetchLiveMetrics(range)} 
            disabled={loading}
            className="flex items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all duration-150 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin text-[#2988ff]" /> : <Filter className="h-3 w-3 text-[#8c8c8c]" />}
            <span>Sync</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Player Balance Reserves */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Player Balances</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20">
              <Coins className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1] font-mono">
              ₹{totalAvailableRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-[#8c8c8c] space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Deposit:</span>
              <span className="text-[#a6a6a6]">₹{totalDepositRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Winnings:</span>
              <span className="text-[#a6a6a6]">₹{totalWinningRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus:</span>
              <span className="text-[#a6a6a6]">₹{totalBonusRupees.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Gross Gaming Revenue (GGR) */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Gross Gaming Revenue</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-[20px] font-semibold tracking-tight font-mono ${ggrRupees >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{ggrRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-[#8c8c8c] space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Total Bets:</span>
              <span className="text-[#a6a6a6]">₹{totalWageredRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Payouts:</span>
              <span className="text-[#a6a6a6]">₹{totalWonRupees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Calculated RTP:</span>
              <span className="text-[#2988ff] font-semibold">
                {totalWageredRupees > 0 ? ((totalWonRupees / totalWageredRupees) * 100).toFixed(2) : '95.00'}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Deposits Settlement */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Settled Deposits</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1] font-mono">
              ₹{approvedDepositRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-[#8c8c8c] space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Pending Queue:</span>
              <span className={deposits.pendingCount > 0 ? 'text-amber-400 font-semibold' : 'text-[#a6a6a6]'}>
                {deposits.pendingCount || 0} req (₹{pendingDepositRupees.toFixed(2)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Settlement:</span>
              <span className="text-emerald-400">100% On-chain / UPI</span>
            </div>
          </div>
        </div>

        {/* Card 4: Player Registrations */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Total Players</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1] font-mono">
              {users.totalUsers || 0}
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-[#8c8c8c] space-y-0.5 font-mono">
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="text-emerald-400">{users.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Banned / Suspended:</span>
              <span className="text-rose-400">{users.bannedUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>New in period:</span>
              <span className="text-[#a6a6a6]">+{users.newUsers || 0}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Row: Game Engine Telemetry */}
      <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#2988ff]" />
            <h2 className="text-[13px] font-medium text-[#e1e1e1]">Authoritative Engine Status — Ring of Future</h2>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#8c8c8c]">Engine State: <strong className="text-emerald-400 uppercase">{games.engineState?.state || 'ACTIVE'}</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-[#8c8c8c]">Round #{games.totalRoundsPlayed || 0}</span>
            <span className="text-white/20">|</span>
            <span className="text-[#8c8c8c]">Time Left: <strong className="text-[#e1e1e1]">{games.engineState?.timeLeft || 0}s</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11.5px] font-mono">
          <div>
            <span className="text-[#8c8c8c] block text-[10px] uppercase">RTP Target</span>
            <span className="text-[#e1e1e1] font-semibold">{games.rtpConfig?.targetPercent || '95.0'}%</span>
          </div>
          <div>
            <span className="text-[#8c8c8c] block text-[10px] uppercase">Bet Min / Max</span>
            <span className="text-[#e1e1e1] font-semibold">₹{games.rtpConfig?.minBetRupees || 10} - ₹{games.rtpConfig?.maxBetRupees || 10000}</span>
          </div>
          <div>
            <span className="text-[#8c8c8c] block text-[10px] uppercase">Pending Payouts</span>
            <span className="text-amber-400 font-semibold">{withdrawals.pendingCount || 0} req (₹{pendingWithdrawRupees.toFixed(2)})</span>
          </div>
          <div>
            <span className="text-[#8c8c8c] block text-[10px] uppercase">Approved Payouts</span>
            <span className="text-emerald-400 font-semibold">₹{approvedWithdrawRupees.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Live Immutable Ledger Stream Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-medium text-[#e1e1e1]">Live Authoritative Ledger Stream</h2>
            <p className="text-[11px] text-[#8c8c8c]">Real-time transactional audit stream directly from PostgreSQL wallet_ledger</p>
          </div>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2988ff]" />}
        </div>

        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Ledger ID</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Bucket</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Balance After</th>
                <th className="px-4 py-2.5">Reference / Notes</th>
                <th className="px-4 py-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#8c8c8c] text-[12px] font-sans">
                    No transactions recorded in the selected time range.
                  </td>
                </tr>
              ) : (
                recentActivity.map((tx: any) => {
                  const amountRupees = Number(tx.amount || 0) / 100;
                  const balanceAfterRupees = Number(tx.balance_after || 0) / 100;
                  const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="px-4 py-2.5 text-[#e1e1e1]">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[100px]">{tx.id}</span>
                          <button 
                            onClick={() => copyToClipboard(tx.id)} 
                            className="text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === tx.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[#a6a6a6]">
                        <span className="truncate max-w-[120px] block" title={tx.user_name || tx.user_id}>
                          {tx.user_name || tx.user_id}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className={`rounded-[3px] border px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                          isCredit
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] uppercase text-[10.5px]">
                        {tx.bucket}
                      </td>
                      <td className={`px-4 py-2.5 font-semibold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amountRupees).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-[#e1e1e1]">
                        ₹{balanceAfterRupees.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '-'}
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] text-[10.5px] whitespace-nowrap">
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
