'use client';
import React, { useState, useEffect } from 'react';
import {
  Filter,
  Loader2,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { adminService, AuditLogItem } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [adminIdFilter, setAdminIdFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAuditLogs({
        limit: 50,
        action: actionFilter.trim() || undefined,
        adminId: adminIdFilter.trim() || undefined
      });
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      console.error('Fetch audit logs error:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Immutable Security Audit Logs</h1>
            <Badge variant="info">Tamper Evident</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Authoritative audit trail of every administrative mutation and policy action</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          aria-label="Refresh audit logs"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {/* Filter Form */}
      <Card as="form" onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 p-3 text-xs">
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by action (e.g. USER_BAN, WALLET_ADJUST)..."
            className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 font-mono text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={adminIdFilter}
            onChange={(e) => setAdminIdFilter(e.target.value)}
            placeholder="Filter by Admin / Staff ID..."
            className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 font-mono text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
        >
          <Filter className="h-3 w-3" />
          <span>Filter Logs</span>
        </Button>
      </Card>

      {/* Audit Logs Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Staff Operator</th>
                <th className="px-4 py-3">Target Subject</th>
                <th className="px-4 py-3">Action Details Payload</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent-primary mb-2" />
                    <span>Loading audit log records from PostgreSQL...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-tertiary font-sans">
                    No security audit log entries matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-subtle transition-fast">
                    <td className="px-4 py-3 text-text-primary">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[80px]">{log.id}</span>
                        <button
                          onClick={() => copyToClipboard(log.id)}
                          className="text-text-tertiary hover:text-text-primary p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                          aria-label={`Copy log ID ${log.id}`}
                        >
                          {copiedId === log.id ? <Check className="h-2.5 w-2.5 text-status-positive" /> : <Copy className="h-2.5 w-2.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <Badge variant="info">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {log.admin_id}
                    </td>
                    <td className="px-4 py-3 text-text-secondary truncate max-w-[120px]" title={log.target_id}>
                      {log.target_id || 'SYSTEM'}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary truncate max-w-[240px]" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
