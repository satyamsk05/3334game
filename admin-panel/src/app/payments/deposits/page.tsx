'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

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
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">Deposit Verification Queue</h1>
          <p className="text-xs text-text-secondary mt-1">Live UTR ledger verification linked to player integer paise balances</p>
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
            Pending ({deposits.filter((d) => d.status === 'PENDING').length})
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
          <Button variant="danger" size="sm" onClick={fetchDeposits}>Retry</Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-tertiary flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
          <span>Synchronizing deposit queue telemetry...</span>
        </div>
      ) : (
        /* Table */
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">UTR / Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-xs">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-tertiary text-xs">
                      No {filter.toLowerCase()} deposit requests in queue.
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((d) => (
                    <tr key={d.depositId} className="hover:bg-surface-subtle transition-fast">
                      
                      <td className="px-4 py-3 font-mono text-xs text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]">{d.depositId}</span>
                          <button 
                            onClick={() => copyToClipboard(d.depositId)} 
                            className="text-text-tertiary hover:text-text-primary transition-fast p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                            aria-label={`Copy deposit order ID ${d.depositId}`}
                          >
                            {copiedId === d.depositId ? <Check className="h-3 w-3 text-status-positive" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-text-secondary">{d.userId}</td>

                      <td className="px-4 py-3 font-mono font-semibold text-sm text-status-positive">
                        ₹{d.amountRupees.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-surface-subtle px-1.5 py-0.5 text-xs border border-border-default">{d.utr || 'NOT_SUBMITTED'}</span>
                          {d.utr && (
                            <button 
                              onClick={() => copyToClipboard(d.utr!)} 
                              className="text-text-tertiary hover:text-text-primary transition-fast p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                              aria-label={`Copy UTR ${d.utr}`}
                            >
                              {copiedId === d.utr ? <Check className="h-3 w-3 text-status-positive" /> : <Copy className="h-3 w-3" />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-text-tertiary text-xs font-mono">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Today'}
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            d.status === 'PENDING' ? 'warning' : d.status === 'APPROVED' ? 'positive' : 'negative'
                          }
                        >
                          {d.status === 'APPROVED' ? 'CREDITED' : d.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        {d.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={processingId === d.depositId}
                              isLoading={processingId === d.depositId}
                              onClick={() => handleApprove(d.depositId, d.amountRupees)}
                              className="bg-status-positive hover:bg-status-positive/90 text-surface-base border-transparent"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve & Credit</span>
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={processingId === d.depositId}
                              isLoading={processingId === d.depositId}
                              onClick={() => handleReject(d.depositId)}
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Reject</span>
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
