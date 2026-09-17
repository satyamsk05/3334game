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

  const handleApprove = async (depositId: string) => {
    try {
      const res = await paymentService.approveDeposit(depositId);
      if (res.success) {
        fetchDeposits();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      const res = await paymentService.rejectDeposit(depositId);
      if (res.success) {
        fetchDeposits();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert(`Rejection failed: ${err.message}`);
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
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Deposit Approval Queue</h1>
          <p className="text-xs text-zinc-400 mt-1">Live UTR verification connected directly to user integer paise wallet ledgers</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-medium text-zinc-400">
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded px-3 py-1 transition ${filter === 'PENDING' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold' : 'hover:text-white'}`}
          >
            Pending ({deposits.filter((d) => d.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`rounded px-3 py-1 transition ${filter === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold' : 'hover:text-white'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`rounded px-3 py-1 transition ${filter === 'REJECTED' ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20 font-semibold' : 'hover:text-white'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Backend Connection Error: {error}</span>
          </div>
          <button onClick={fetchDeposits} className="rounded bg-rose-500/20 px-2.5 py-1 font-semibold hover:bg-rose-500/30">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
          <span>Fetching deposit records from backend API...</span>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Deposit Amount</th>
                <th className="px-4 py-3">UTR / Ref Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans text-xs">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500 text-xs">
                    No {filter.toLowerCase()} deposit requests in system.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((d) => (
                  <tr key={d.depositId} className="hover:bg-zinc-900/60 transition">
                    
                    <td className="px-4 py-3 font-mono text-zinc-200">
                      <div className="flex items-center gap-1">
                        <span>{d.depositId}</span>
                        <button onClick={() => copyToClipboard(d.depositId)} className="text-zinc-500 hover:text-zinc-300">
                          {copiedId === d.depositId ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-zinc-400">{d.userId}</td>

                    <td className="px-4 py-3 font-mono font-bold text-sm text-emerald-400">
                      ₹{d.amountRupees.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 font-mono text-zinc-300">
                      <div className="flex items-center gap-1">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] border border-zinc-700">{d.utr || 'NOT_SUBMITTED'}</span>
                        {d.utr && (
                          <button onClick={() => copyToClipboard(d.utr!)} className="text-zinc-500 hover:text-zinc-300">
                            {copiedId === d.utr ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-zinc-500 text-[11px]">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today'}
                    </td>

                    <td className="px-4 py-3">
                      {d.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" /> PENDING
                        </span>
                      )}
                      {d.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> CREDITED
                        </span>
                      )}
                      {d.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> REJECTED
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {d.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(d.depositId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Credit
                          </button>
                          <button
                            onClick={() => handleReject(d.depositId)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
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
