'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface WithdrawalRecord {
  withdrawalId: string;
  userId: string;
  amountRupees: number;
  upiId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

export default function WithdrawalsQueuePage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentService.getWithdrawals();
      if (res.success && Array.isArray(res.data)) {
        setWithdrawals(res.data);
      } else {
        setWithdrawals([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch withdrawals:', err);
      setError(err.message || 'Could not connect to live backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (withdrawalId: string, amount: number, upiId: string) => {
    if (!window.confirm(`Are you sure you want to APPROVE withdrawal of ₹${amount.toFixed(2)} to ${upiId} (${withdrawalId})?`)) {
      return;
    }
    try {
      setProcessingId(withdrawalId);
      const res = await paymentService.approveWithdrawal(withdrawalId);
      if (res.success) {
        await fetchWithdrawals();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err: any) {
      alert(`Approval failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!window.confirm(`Are you sure you want to REJECT withdrawal (${withdrawalId}) and refund user wallet?`)) {
      return;
    }
    try {
      setProcessingId(withdrawalId);
      const res = await paymentService.rejectWithdrawal(withdrawalId);
      if (res.success) {
        await fetchWithdrawals();
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

  const filtered = withdrawals.filter((w) => w.status === filter);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Withdrawal Verification Queue</h1>
          <p className="text-xs text-text-secondary mt-1">Live UPI payout processing connected to winnings bucket ledger</p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center rounded-md border border-border-default bg-surface-raised p-0.5 text-xs font-medium text-text-secondary">
          <button
            onClick={() => setFilter('PENDING')}
            className={`rounded px-2.5 py-1 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
              filter === 'PENDING'
                ? 'text-status-warning bg-status-warning/10 font-semibold'
                : 'hover:text-text-primary'
            }`}
          >
            Pending ({withdrawals.filter((w) => w.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`rounded px-2.5 py-1 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
              filter === 'APPROVED'
                ? 'text-status-positive bg-status-positive/10 font-semibold'
                : 'hover:text-text-primary'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`rounded px-2.5 py-1 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
              filter === 'REJECTED'
                ? 'text-status-negative bg-status-negative/10 font-semibold'
                : 'hover:text-text-primary'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Backend Server Connection Error: {error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={fetchWithdrawals}>Retry</Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-tertiary flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
          <span>Synchronizing withdrawal queue telemetry...</span>
        </div>
      ) : (
        /* Table */
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3">Withdrawal ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Payout Amount</th>
                  <th className="px-4 py-3">Target UPI ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-tertiary text-xs">
                      No {filter.toLowerCase()} payout requests in queue.
                    </td>
                  </tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w.withdrawalId} className="hover:bg-surface-subtle transition-fast">
                      
                      <td className="px-4 py-3 font-mono text-xs text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{w.withdrawalId}</span>
                          <button 
                            onClick={() => copyToClipboard(w.withdrawalId)} 
                            className="text-text-tertiary hover:text-text-primary transition-fast p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`Copy withdrawal ID ${w.withdrawalId}`}
                          >
                            {copiedId === w.withdrawalId ? <Check className="h-3 w-3 text-status-positive" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{w.userId}</td>

                      <td className="px-4 py-3 font-mono font-semibold text-sm text-status-negative">
                        -₹{w.amountRupees.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-xs border border-border-default text-accent-primary">{w.upiId}</span>
                          <button 
                            onClick={() => copyToClipboard(w.upiId)} 
                            className="text-text-tertiary hover:text-text-primary transition-fast p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`Copy UPI ID ${w.upiId}`}
                          >
                            {copiedId === w.upiId ? <Check className="h-3 w-3 text-status-positive" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-text-tertiary text-xs font-mono">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : 'Today'}
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            w.status === 'PENDING' ? 'warning' : w.status === 'APPROVED' ? 'positive' : 'negative'
                          }
                        >
                          {w.status === 'APPROVED' ? 'PAID OUT' : w.status === 'REJECTED' ? 'REFUNDED' : w.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {w.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={processingId === w.withdrawalId}
                              isLoading={processingId === w.withdrawalId}
                              onClick={() => handleApprove(w.withdrawalId, w.amountRupees, w.upiId)}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve & Pay</span>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={processingId === w.withdrawalId}
                              isLoading={processingId === w.withdrawalId}
                              onClick={() => handleReject(w.withdrawalId)}
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Reject & Refund</span>
                            </Button>
                          </div>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}
