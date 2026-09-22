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
    <div className="space-y-6">
      
      {/* Premation Studio Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Studio Telemetry</h1>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative ledger metrics & transactional pipeline</p>
        </div>

        {/* Date Filter Segmented Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
            <button className="rounded-[3px] px-2 py-0.5 text-[#e1e1e1] bg-white/[0.08] font-medium shadow-sm">24h</button>
            <button className="rounded-[3px] px-2 py-0.5 hover:text-[#e1e1e1] transition-colors">7d</button>
            <button className="rounded-[3px] px-2 py-0.5 hover:text-[#e1e1e1] transition-colors">30d</button>
            <button className="rounded-[3px] px-2 py-0.5 hover:text-[#e1e1e1] transition-colors">All</button>
          </div>

          <button 
            onClick={fetchLiveMetrics} 
            className="flex items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all duration-150"
          >
            <Filter className="h-3 w-3 text-[#8c8c8c]" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Premation Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Deposits */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Approved Deposits</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1]">₹{totalDepositsRupees.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Settled player credits</p>
        </div>

        {/* Card 2: Withdrawals */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Approved Payouts</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1]">₹{totalWithdrawalsRupees.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Disbursed UPI transfers</p>
        </div>

        {/* Card 3: Registered Players */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Active Players</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-[#e1e1e1]">{usersCount}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Verified user records</p>
        </div>

        {/* Card 4: Net System Reserve */}
        <div className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase tracking-wider">
            <span>Net System Reserve</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-[3px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[20px] font-semibold tracking-tight text-emerald-400">₹{netReserve.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c]">Real-time liquid reserve</p>
        </div>

      </div>

      {/* Live Activity Stream Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-medium text-[#e1e1e1]">Live Transaction Telemetry</h2>
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2988ff]" />}
        </div>

        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Transaction ID</th>
                <th className="px-4 py-2.5">User ID</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Reference</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8c8c8c] text-[12px] font-sans">
                    No transactions recorded yet in authoritative database.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="px-4 py-2.5 text-[#e1e1e1]">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{tx.id}</span>
                        <button 
                          onClick={() => copyToClipboard(tx.id)} 
                          className="text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors"
                          title="Copy ID"
                        >
                          {copiedId === tx.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[#a6a6a6]">{tx.user}</td>
                    <td className="px-4 py-2.5 font-sans">
                      <span className={`rounded-[3px] border px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                        tx.type === 'DEPOSIT' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 font-semibold ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}₹{(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-[#8c8c8c] truncate max-w-[140px]">{tx.ref || '-'}</td>
                    <td className="px-4 py-2.5 font-sans text-[11px]">
                      {tx.status === 'APPROVED' && <span className="text-emerald-400 font-medium">SUCCESS</span>}
                      {tx.status === 'PENDING' && <span className="text-amber-400 font-medium">PENDING</span>}
                      {tx.status === 'REJECTED' && <span className="text-rose-400 font-medium">REJECTED</span>}
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
