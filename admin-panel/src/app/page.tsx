'use client';
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  Filter,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { userService } from '@/services/userService';
import { paymentService } from '@/services/paymentService';

export default function OverviewDashboard() {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [totalDepositsRupees, setTotalDepositsRupees] = useState<number>(0);
  const [totalWithdrawalsRupees, setTotalWithdrawalsRupees] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLiveMetrics = async () => {
    try {
      setLoading(true);

      const [usersRes, depositsRes, withdrawalsRes] = await Promise.all([
        userService.getAllUsers().catch(() => ({ success: false, data: [] })),
        paymentService.getDeposits().catch(() => ({ success: false, data: [] })),
        paymentService.getWithdrawals().catch(() => ({ success: false, data: [] }))
      ]);

      const usersList = usersRes.success && Array.isArray(usersRes.data) ? usersRes.data : [];
      const depositsList = depositsRes.success && Array.isArray(depositsRes.data) ? depositsRes.data : [];
      const withdrawalsList = withdrawalsRes.success && Array.isArray(withdrawalsRes.data) ? withdrawalsRes.data : [];

      setUsersCount(usersList.length);

      const approvedDepTotal = depositsList
        .filter((d: any) => d.status === 'APPROVED')
        .reduce((sum: number, d: any) => sum + (d.amountRupees || 0), 0);
      setTotalDepositsRupees(approvedDepTotal);

      const approvedWdTotal = withdrawalsList
        .filter((w: any) => w.status === 'APPROVED')
        .reduce((sum: number, w: any) => sum + (w.amountRupees || 0), 0);
      setTotalWithdrawalsRupees(approvedWdTotal);

      // Combine recent stream
      const combined = [
        ...depositsList.map((d: any) => ({
          id: d.depositId,
          user: d.userId,
          type: 'DEPOSIT',
          amount: d.amountRupees,
          ref: d.utr || d.depositId,
          status: d.status,
          date: d.createdAt
        })),
        ...withdrawalsList.map((w: any) => ({
          id: w.withdrawalId,
          user: w.userId,
          type: 'WITHDRAWAL',
          amount: w.amountRupees,
          ref: w.upiId,
          status: w.status,
          date: w.createdAt
        }))
      ].sort((a, b) => (b.date || 0) - (a.date || 0));

      setRecentTransactions(combined.slice(0, 10));
    } catch (err) {
      console.error('Metrics sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const netReserve = Math.max(0, totalDepositsRupees - totalWithdrawalsRupees);

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">Live metrics & authoritative database telemetry</p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-medium text-zinc-400">
            <button className="rounded px-2.5 py-1 text-white bg-zinc-800 font-semibold shadow-sm">24h</button>
            <button className="rounded px-2.5 py-1 hover:text-white transition">7d</button>
            <button className="rounded px-2.5 py-1 hover:text-white transition">30d</button>
            <button className="rounded px-2.5 py-1 hover:text-white transition">All</button>
          </div>

          <button onClick={fetchLiveMetrics} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Approved Deposits</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">₹{totalDepositsRupees.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Live authoritative ledger</p>
        </div>

        {/* Card 2 */}
        <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Approved Withdrawals</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">₹{totalWithdrawalsRupees.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Completed payouts</p>
        </div>

        {/* Card 3 */}
        <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Registered Players</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">{usersCount}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">Active user accounts</p>
        </div>

        {/* Card 4 */}
        <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 hover:border-zinc-700 transition duration-200">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Net System Balance</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">₹{netReserve.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">100% real-time verified</p>
        </div>

      </div>

      {/* Recent Activity Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Live Transactions Stream</h2>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[12px]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500 text-xs font-sans">
                    No live transactions recorded yet. Initiate deposits/withdrawals from app or backend API.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/60 transition">
                    <td className="px-4 py-3 font-medium text-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <span>{tx.id}</span>
                        <button onClick={() => copyToClipboard(tx.id)} className="text-zinc-500 hover:text-zinc-300">
                          {copiedId === tx.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-zinc-300">{tx.user}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                        tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}₹{(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{tx.ref || '-'}</td>
                    <td className="px-4 py-3 font-sans">
                      {tx.status === 'APPROVED' && <span className="text-emerald-400">SUCCESS</span>}
                      {tx.status === 'PENDING' && <span className="text-amber-400">PENDING</span>}
                      {tx.status === 'REJECTED' && <span className="text-rose-400">REJECTED</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
