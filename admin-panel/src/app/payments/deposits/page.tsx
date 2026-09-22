'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';

interface DepositOrder {
  depositId: string;
  userId: string;
  amountRupees: number;
  utr?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

export default function DepositsQueuePage() {
  const [deposits, setDeposits] = useState<DepositOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getDeposits();
      if (res.success && Array.isArray(res.data)) {
        setDeposits(res.data);
      } else {
        setDeposits([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch deposits:', err);
      setError(err.message || 'Could not connect to live backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (depositId: string, amount: number) => {
    if (!window.confirm(`Are you sure you want to APPROVE deposit of ₹${amount.toFixed(2)} (${depositId}) and credit player wallet?`)) {
      return;
    }
    try {
      setProcessingId(depositId);
      const res = await paymentService.approveDeposit(depositId);
      if (res.success) {
        await fetchDeposits();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (depositId: string) => {
    if (!window.confirm(`Are you sure you want to REJECT deposit (${depositId})?`)) {
      return;
    }
    try {
      setProcessingId(depositId);
      const res = await paymentService.rejectDeposit(depositId);
      if (res.success) {
        await fetchDeposits();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeposits = deposits.filter((d) => d.status === filter);

  return (
    <div className="space-y-6">
      
      {/* Studio Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Deposit Verification Queue</h1>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Live UTR ledger verification linked to player integer paise balances</p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded-[3px] px-2.5 py-0.5 transition-colors ${filter === 'PENDING' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-medium' : 'hover:text-[#e1e1e1]'}`}
          >
            Pending ({deposits.filter((d) => d.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`rounded-[3px] px-2.5 py-0.5 transition-colors ${filter === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-medium' : 'hover:text-[#e1e1e1]'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`rounded-[3px] px-2.5 py-0.5 transition-colors ${filter === 'REJECTED' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-medium' : 'hover:text-[#e1e1e1]'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-[4px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Backend Server Connection Error: {error}</span>
          </div>
          <button onClick={fetchDeposits} className="rounded-[3px] bg-red-500/20 px-2 py-0.5 font-medium hover:bg-red-500/30">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-[12px] text-[#8c8c8c] flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-[#2988ff]" />
          <span>Synchronizing deposit queue telemetry...</span>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Order ID</th>
                <th className="px-4 py-2.5">User ID</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">UTR / Reference</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[12px]">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#8c8c8c] text-[12px]">
                    No {filter.toLowerCase()} deposit requests in queue.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((d) => (
                  <tr key={d.depositId} className="hover:bg-white/[0.02] transition-colors duration-150">
                    
                    <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#e1e1e1]">
                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{d.depositId}</span>
                        <button 
                          onClick={() => copyToClipboard(d.depositId)} 
                          className="text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedId === d.depositId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#a6a6a6]">{d.userId}</td>

                    <td className="px-4 py-2.5 font-mono font-semibold text-[13px] text-emerald-400">
                      ₹{d.amountRupees.toFixed(2)}
                    </td>

                    <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#e1e1e1]">
                      <div className="flex items-center gap-1">
                        <span className="rounded-[3px] bg-white/[0.04] px-1.5 py-0.5 text-[11px] border border-white/[0.08]">{d.utr || 'NOT_SUBMITTED'}</span>
                        {d.utr && (
                          <button onClick={() => copyToClipboard(d.utr!)} className="text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors">
                            {copiedId === d.utr ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-2.5 text-[#8c8c8c] text-[11px] font-mono">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today'}
                    </td>

                    <td className="px-4 py-2.5">
                      {d.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 rounded-[3px] border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-400">
                          <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" /> PENDING
                        </span>
                      )}
                      {d.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 rounded-[3px] border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" /> CREDITED
                        </span>
                      )}
                      {d.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 rounded-[3px] border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-rose-400">
                          <span className="h-1 w-1 rounded-full bg-rose-400" /> REJECTED
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-right">
                      {d.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={processingId === d.depositId}
                            onClick={() => handleApprove(d.depositId, d.amountRupees)}
                            className="inline-flex items-center gap-1 rounded-[4px] border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            {processingId === d.depositId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            <span>Approve & Credit</span>
                          </button>
                          <button
                            disabled={processingId === d.depositId}
                            onClick={() => handleReject(d.depositId)}
                            className="inline-flex items-center gap-1 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-[#8c8c8c] hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                          >
                            {processingId === d.depositId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
