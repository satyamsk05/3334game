'use client';
import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Database,
  Cpu,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function SystemHealthPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSystemHealth();
      if (res.success && res.data) {
        setHealth(res.data);
      } else {
        setError(res.message || 'Failed to fetch node health');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Telemetry connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // 10s live pulse
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Authoritative Node Health</h1>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pulse Active (10s)
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Real-time Node.js runtime process and PostgreSQL connection pool status</p>
        </div>

        <button
          onClick={fetchHealth}
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

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Core Node State */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase">
            <span>Server Process</span>
            <Server className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">ONLINE</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c] font-mono">PID {health?.pid || '—'}</p>
        </div>

        {/* Card 2: Database Connectivity */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase">
            <span>PostgreSQL Pool</span>
            <Database className="h-4 w-4 text-[#2988ff]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono ${health?.database === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {health?.database || 'CONNECTING...'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c] font-mono">
            Latency: <strong className="text-[#e1e1e1]">{health?.dbLatencyMs || '<5'}ms</strong>
          </p>
        </div>

        {/* Card 3: Memory Footprint */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase">
            <span>Process Heap</span>
            <Cpu className="h-4 w-4 text-[#a6a6a6]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#e1e1e1]">
              {health?.memory?.heapUsedMb || 0} MB
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c] font-mono">
            RSS: {health?.memory?.rssMb || 0} MB
          </p>
        </div>

        {/* Card 4: WebSocket Clients */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
          <div className="flex items-center justify-between text-[#8c8c8c] text-[11px] font-mono uppercase">
            <span>Active WebSocket</span>
            <Radio className="h-4 w-4 text-[#2988ff]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#e1e1e1]">
              {health?.activeWsConnections || 0}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#8c8c8c] font-mono">Live connected players</p>
        </div>

      </div>

      {/* Process Telemetry Spec */}
      <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
        <h3 className="text-[13px] font-semibold text-[#e1e1e1] border-b border-white/[0.06] pb-3">
          Process Runtime Environment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[12px] font-mono">
          <div>
            <span className="text-[#8c8c8c] block text-[11px]">System Uptime</span>
            <span className="text-[#e1e1e1] font-semibold">
              {health?.uptimeSeconds ? formatUptime(health.uptimeSeconds) : '0s'}
            </span>
          </div>
          <div>
            <span className="text-[#8c8c8c] block text-[11px]">Node.js Version</span>
            <span className="text-[#e1e1e1] font-semibold">{health?.nodeVersion || process.version || 'v20.x'}</span>
          </div>
          <div>
            <span className="text-[#8c8c8c] block text-[11px]">Server Timestamp</span>
            <span className="text-[#e1e1e1]">{health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
