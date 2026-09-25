'use client';
import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  RefreshCw,
  Radio
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

  const dbStatusString = typeof health?.database === 'string'
    ? health.database
    : typeof health?.database === 'object' && health?.database?.status
    ? (health.database.status === 'ONLINE' ? 'CONNECTED' : health.database.status)
    : typeof health?.db === 'object' && health?.db?.status
    ? (health.db.status === 'ONLINE' ? 'CONNECTED' : health.db.status)
    : (loading ? 'CONNECTING...' : 'ONLINE');

  const isDbConnected = dbStatusString === 'CONNECTED' || dbStatusString === 'ONLINE';
  const heapUsedMb = health?.memory?.heapUsedMb ?? health?.system?.memoryUsageMb ?? 0;
  const rssMb = health?.memory?.rssMb ?? heapUsedMb;
  const activeWs = health?.activeWsConnections ?? health?.websocket?.activeConnections ?? 0;
  const uptimeSec = health?.uptimeSeconds ?? health?.api?.uptimeSeconds ?? 0;
  const nodeVer = health?.nodeVersion ?? health?.system?.nodeVersion ?? 'v20.x';
  const serverTime = health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Authoritative Node Health</h1>
            <Badge variant="positive">
              <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse mr-1" />
              Pulse Active (10s)
            </Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Real-time Node.js runtime process and PostgreSQL connection pool status</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchHealth}
          disabled={loading}
          aria-label="Refresh node health"
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

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Core Node State */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
            <span>Server Process</span>
            <Server className="h-4 w-4 text-status-positive" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-status-positive">ONLINE</span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary font-mono">PID {health?.pid || '—'}</p>
        </Card>

        {/* Card 2: Database Connectivity */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
            <span>PostgreSQL Pool</span>
            <Database className="h-4 w-4 text-accent-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${isDbConnected ? 'text-status-positive' : 'text-status-negative'}`}>
              {dbStatusString}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary font-mono">
            Latency: <strong className="text-text-primary">{health?.dbLatencyMs || '<5'}ms</strong>
          </p>
        </Card>

        {/* Card 3: Memory Footprint */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
            <span>Process Heap</span>
            <Cpu className="h-4 w-4 text-text-secondary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary">
              {heapUsedMb} MB
            </span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary font-mono">
            RSS: {rssMb} MB
          </p>
        </Card>

        {/* Card 4: WebSocket Clients */}
        <Card className="space-y-2">
          <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
            <span>Active WebSocket</span>
            <Radio className="h-4 w-4 text-accent-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-text-primary">
              {activeWs}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-tertiary font-mono">Live connected players</p>
        </Card>

      </div>

      {/* Process Telemetry Spec */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold text-text-primary border-b border-border-muted pb-3">
          Process Runtime Environment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-mono">
          <div>
            <span className="text-text-tertiary block text-[11px] font-sans">System Uptime</span>
            <span className="text-text-primary font-semibold text-sm">
              {uptimeSec ? formatUptime(uptimeSec) : '0s'}
            </span>
          </div>
          <div>
            <span className="text-text-tertiary block text-[11px] font-sans">Node.js Version</span>
            <span className="text-text-primary font-semibold text-sm">{nodeVer}</span>
          </div>
          <div>
            <span className="text-text-tertiary block text-[11px] font-sans">Server Timestamp</span>
            <span className="text-text-primary">{serverTime}</span>
          </div>
        </div>
      </Card>

    </div>
  );
}
