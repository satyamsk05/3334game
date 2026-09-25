'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import { adminService, AuditLogItem } from '@/services/adminService';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Immutable Security Audit Logs</h1>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10.5px] font-mono text-purple-400 border border-purple-500/20">
              Tamper Evident
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative audit trail of every administrative mutation and policy action</p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-3 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] transition-all"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#2988ff]' : 'text-[#8c8c8c]'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Filter Form */}
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3 rounded-[8px] border border-white/[0.08] bg-[#212123] p-3 text-[12px]">
        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            placeholder="Filter by action (e.g. USER_BAN, WALLET_ADJUST)..."
            className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            value={adminIdFilter}
            onChange={(e) => setAdminIdFilter(e.target.value)}
            placeholder="Filter by Admin / Staff ID..."
            className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="flex h-8 items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3 font-medium text-white hover:bg-[#2988ff]/90 transition-all shadow-sm"
        >
          <Filter className="h-3 w-3" />
          <span>Filter Logs</span>
        </button>
      </form>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
        <table className="w-full text-left text-[12px] text-[#a6a6a6]">
          <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="px-4 py-3">Log ID</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Staff Operator</th>
              <th className="px-4 py-3">Target Subject</th>
              <th className="px-4 py-3">Action Details Payload</th>
              <th className="px-4 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#8c8c8c]">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2988ff] mb-2" />
                  <span>Loading audit log records from PostgreSQL...</span>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#8c8c8c] font-sans">
                  No security audit log entries matching criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-[#e1e1e1]">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[80px]">{log.id}</span>
                      <button
                        onClick={() => copyToClipboard(log.id)}
                        className="text-[#666] hover:text-[#e1e1e1]"
                        title="Copy ID"
                      >
                        {copiedId === log.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="px-2 py-0.5 rounded-[3px] text-[10.5px] font-mono font-bold bg-[#2988ff]/10 border border-[#2988ff]/20 text-[#2988ff]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#e1e1e1]">
                    {log.admin_id}
                  </td>
                  <td className="px-4 py-3 text-[#a6a6a6] truncate max-w-[120px]" title={log.target_id}>
                    {log.target_id || 'SYSTEM'}
                  </td>
                  <td className="px-4 py-3 text-[#8c8c8c] truncate max-w-[240px]" title={JSON.stringify(log.details)}>
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="px-4 py-3 text-[#8c8c8c] text-[10.5px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
