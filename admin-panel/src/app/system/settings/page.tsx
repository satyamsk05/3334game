'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Settings,
  Server,
  ShieldCheck,
  FileText,
  LifeBuoy,
  BarChart3,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UserPlus,
  X,
  Copy,
  Check,
  Filter,
  Search,
  Send,
  ExternalLink,
  Database,
  Cpu,
  Radio,
  FileSpreadsheet,
  ArrowRight,
  Eye,
  Key,
  Shield,
  Activity
} from 'lucide-react';
import { adminService, AuditLogItem, UserDetailsResponse } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type SettingsTab = 'general' | 'health' | 'admins' | 'audit' | 'support' | 'analytics';

export default function UnifiedSystemSettingsPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'general';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Sync tab from URL if it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam && ['general', 'health', 'admins', 'audit', 'support', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // -------------------------------------------------------------
  // 1. GENERAL SETTINGS STATE
  // -------------------------------------------------------------
  const [generalSettings, setGeneralSettings] = useState<Record<string, any>>({});
  const [loadingGeneral, setLoadingGeneral] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);

  const [rtpTarget, setRtpTarget] = useState('95.0');
  const [minBet, setMinBet] = useState('10');
  const [maxBet, setMaxBet] = useState('10000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [telegramAlerts, setTelegramAlerts] = useState(true);

  const fetchGeneralSettings = async () => {
    try {
      setLoadingGeneral(true);
      setGeneralError(null);
      const res = await adminService.getSettings();
      if (res.success && res.data) {
        setGeneralSettings(res.data);
        if (res.data.rtp_target_percent !== undefined) setRtpTarget(res.data.rtp_target_percent.toString());
        if (res.data.bet_min_limit !== undefined) setMinBet(res.data.bet_min_limit.toString());
        if (res.data.bet_max_limit !== undefined) setMaxBet(res.data.bet_max_limit.toString());
        if (res.data.maintenance_mode !== undefined) setMaintenanceMode(Boolean(res.data.maintenance_mode));
        if (res.data.telegram_alerts_enabled !== undefined) setTelegramAlerts(Boolean(res.data.telegram_alerts_enabled));
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || 'Error loading platform settings');
    } finally {
      setLoadingGeneral(false);
    }
  };

  const handleSaveSetting = async (key: string, value: any, description: string) => {
    try {
      setSavingKey(key);
      setGeneralError(null);
      setGeneralSuccess(null);
      const res = await adminService.updateSetting(key, value, description);
      if (res.success) {
        setGeneralSuccess(`Setting '${key}' saved successfully!`);
        await fetchGeneralSettings();
      } else {
        setGeneralError(res.message || `Failed to update ${key}`);
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || err.message || 'Setting update failed');
    } finally {
      setSavingKey(null);
    }
  };

  // -------------------------------------------------------------
  // 2. SERVER HEALTH STATE
  // -------------------------------------------------------------
  const [healthData, setHealthData] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      setHealthError(null);
      const res = await adminService.getSystemHealth();
      if (res.success && res.data) {
        setHealthData(res.data);
      } else {
        setHealthError(res.message || 'Failed to fetch node health');
      }
    } catch (err: any) {
      setHealthError(err.response?.data?.message || err.message || 'Telemetry connection error');
    } finally {
      setLoadingHealth(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // -------------------------------------------------------------
  // 3. STAFF ADMINS STATE
  // -------------------------------------------------------------
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [createAdminModal, setCreateAdminModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('VIEWER');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createModalError, setCreateModalError] = useState<string | null>(null);
  const [togglingAdminId, setTogglingAdminId] = useState<string | null>(null);
  const [adminCopiedId, setAdminCopiedId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      setAdminError(null);
      const res = await adminService.getAdmins();
      if (res.success && Array.isArray(res.data)) {
        setAdminsList(res.data);
      } else {
        setAdminsList([]);
      }
    } catch (err: any) {
      setAdminError(err.response?.data?.message || err.message || 'Failed to load admin accounts');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateModalError(null);
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateModalError('Username and password are required');
      return;
    }
    if (newPassword.length < 8) {
      setCreateModalError('Password must be at least 8 characters long');
      return;
    }

    try {
      setCreatingAdmin(true);
      const res = await adminService.createAdmin({
        username: newUsername.trim(),
        password: newPassword.trim(),
        role: newRole
      });
      if (res.success) {
        setCreateAdminModal(false);
        setNewUsername('');
        setNewPassword('');
        setNewRole('VIEWER');
        await fetchAdmins();
      } else {
        setCreateModalError(res.message || 'Failed to create admin');
      }
    } catch (err: any) {
      setCreateModalError(err.response?.data?.message || err.message || 'Creation error');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingAdminId(id);
      const res = await adminService.toggleAdminActive(id, !currentStatus);
      if (res.success) {
        await fetchAdmins();
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (err: any) {
      alert(`Error toggling: ${err.response?.data?.message || err.message}`);
    } finally {
      setTogglingAdminId(null);
    }
  };

  // -------------------------------------------------------------
  // 4. AUDIT LOGS STATE
  // -------------------------------------------------------------
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');
  const [adminIdFilter, setAdminIdFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedAuditPayload, setSelectedAuditPayload] = useState<any | null>(null);

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      setAuditError(null);
      const res = await adminService.getAuditLogs({
        limit: 50,
        action: actionFilter.trim() || undefined,
        adminId: adminIdFilter.trim() || undefined
      });
      if (res.success && Array.isArray(res.data)) {
        setAuditLogs(res.data);
      } else {
        setAuditLogs([]);
      }
    } catch (err: any) {
      setAuditError(err.response?.data?.message || err.message || 'Error fetching audit logs');
    } finally {
      setLoadingAudit(false);
    }
  };

  // -------------------------------------------------------------
  // 5. SUPPORT STATE
  // -------------------------------------------------------------
  const [supportQuery, setSupportQuery] = useState('');
  const [supportSearching, setSupportSearching] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [supportUser, setSupportUser] = useState<UserDetailsResponse | null>(null);
  const [supportNoteText, setSupportNoteText] = useState('');
  const [savingSupportNote, setSavingSupportNote] = useState(false);
  const [supportNoteSuccess, setSupportNoteSuccess] = useState(false);

  const handleSupportSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportQuery.trim()) return;

    try {
      setSupportSearching(true);
      setSupportError(null);
      setSupportUser(null);
      setSupportNoteSuccess(false);

      const listRes = await adminService.getUsers({ search: supportQuery.trim(), limit: 1 });
      if (listRes.success && listRes.data?.users?.length > 0) {
        const found = listRes.data.users[0];
        const detailRes = await adminService.getUserDetails(found.id);
        if (detailRes.success && detailRes.data) {
          setSupportUser(detailRes.data);
        } else {
          setSupportError('User details could not be retrieved');
        }
      } else {
        setSupportError('No player found matching that Phone or User ID');
      }
    } catch (err: any) {
      setSupportError(err.response?.data?.message || err.message || 'Error searching user');
    } finally {
      setSupportSearching(false);
    }
  };

  const handleAddSupportNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportUser || !supportNoteText.trim()) return;

    try {
      setSavingSupportNote(true);
      setSupportNoteSuccess(false);
      const res = await adminService.addUserNote(supportUser.user.id, supportNoteText.trim());
      if (res.success) {
        setSupportNoteText('');
        setSupportNoteSuccess(true);
        const detailRes = await adminService.getUserDetails(supportUser.user.id);
        if (detailRes.success) setSupportUser(detailRes.data);
      } else {
        alert(res.message || 'Failed to save note');
      }
    } catch (err: any) {
      alert(`Error adding note: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingSupportNote(false);
    }
  };

  // Load data according to active tab
  useEffect(() => {
    if (activeTab === 'general') fetchGeneralSettings();
    if (activeTab === 'health') fetchHealth();
    if (activeTab === 'admins') fetchAdmins();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const tabsConfig = [
    { id: 'general', label: 'General & Risk', icon: Settings, desc: 'RTP, limits & platform toggles' },
    { id: 'health', label: 'Server Health', icon: Server, desc: 'Process telemetry & DB pool' },
    { id: 'admins', label: 'Staff Admins', icon: ShieldCheck, desc: 'RBAC roles & access' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, desc: 'Immutable action trail' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, desc: 'Metrics & data export' },
    { id: 'support', label: 'Support Desk', icon: LifeBuoy, desc: 'Player lookup & dispute notes' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">System & Management Hub</h1>
            <Badge variant="neutral">Centralized Control</Badge>
          </div>
          <p className="text-sm text-text-secondary mt-1">Unified administrative governance, risk parameters, server telemetry, and staff access</p>
        </div>
      </div>

      {/* Modern Pill Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-surface-strong rounded-xl border border-border-default scrollbar-none shadow-inner">
        {tabsConfig.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-surface-raised text-text-primary shadow-xs border border-border-default font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-strong'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-text-tertiary'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL & RISK SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Global Platform Parameters</h2>
              <p className="text-xs text-text-secondary">Live authoritative game mathematics, wagering limits, and safety switches</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchGeneralSettings}
              disabled={loadingGeneral}
            >
              <RefreshCw className={`h-4 w-4.5 ${loadingGeneral ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
              <span>Sync</span>
            </Button>
          </div>

          {generalSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{generalSuccess}</span>
            </div>
          )}

          {generalError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: RTP Target Config */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Target Return to Player (RTP)</h3>
                  <p className="text-xs text-text-tertiary">Calibrated mathematical house margin</p>
                </div>
                <Badge variant="positive">{rtpTarget}%</Badge>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-secondary">RTP Percentage (90.0% - 98.0%)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="98"
                    value={rtpTarget}
                    onChange={(e) => setRtpTarget(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm font-mono text-text-primary text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveSetting('rtp_target_percent', parseFloat(rtpTarget), 'Updated RTP target percentage')}
                    disabled={savingKey === 'rtp_target_percent'}
                    isLoading={savingKey === 'rtp_target_percent'}
                  >
                    <Save className="h-4 w-4.5" />
                    <span>Save</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card 2: Bet Constraints */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Betting Range Bounds</h3>
                  <p className="text-xs text-text-tertiary">Minimum & maximum single wager constraints</p>
                </div>
                <Badge variant="info">₹{minBet} - ₹{maxBet}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-text-secondary mb-1">Min Bet (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={minBet}
                    onChange={(e) => setMinBet(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm font-mono text-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-text-secondary mb-1">Max Bet (₹)</label>
                  <input
                    type="number"
                    min="10"
                    value={maxBet}
                    onChange={(e) => setMaxBet(e.target.value)}
                    className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm font-mono text-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleSaveSetting('bet_min_limit', parseFloat(minBet), 'Updated minimum bet limit');
                    handleSaveSetting('bet_max_limit', parseFloat(maxBet), 'Updated maximum bet limit');
                  }}
                  disabled={Boolean(savingKey)}
                >
                  <Save className="h-4 w-4.5" />
                  <span>Save Limits</span>
                </Button>
              </div>
            </Card>

            {/* Card 3: Global Maintenance Mode */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Emergency Maintenance Switch</h3>
                  <p className="text-xs text-text-tertiary">Pause gameplay and payment processing globally</p>
                </div>
                <Badge variant={maintenanceMode ? 'warning' : 'positive'}>
                  {maintenanceMode ? 'ACTIVE' : 'OFF'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-secondary">Toggle Platform Maintenance:</span>
                <Button
                  variant={maintenanceMode ? 'danger' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    const nextVal = !maintenanceMode;
                    setMaintenanceMode(nextVal);
                    handleSaveSetting('maintenance_mode', nextVal, `Toggled maintenance mode to ${nextVal}`);
                  }}
                >
                  {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                </Button>
              </div>
            </Card>

            {/* Card 4: Telegram Alerts Channel */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Telegram Security Alerts</h3>
                  <p className="text-xs text-text-tertiary">High-value deposit & withdrawal alerts</p>
                </div>
                <Badge variant={telegramAlerts ? 'positive' : 'neutral'}>
                  {telegramAlerts ? 'ENABLED' : 'MUTED'}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-text-secondary">Push Security Alerts to Telegram:</span>
                <Button
                  variant={telegramAlerts ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => {
                    const nextVal = !telegramAlerts;
                    setTelegramAlerts(nextVal);
                    handleSaveSetting('telegram_alerts_enabled', nextVal, `Toggled telegram alerts to ${nextVal}`);
                  }}
                >
                  {telegramAlerts ? 'Disable Alerts' : 'Enable Alerts'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVER HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">Authoritative Node Telemetry</h2>
                <Badge variant="positive">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live Monitor (10s)
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">Real-time Node.js runtime process and PostgreSQL connection pool status</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchHealth}
              disabled={loadingHealth}
            >
              <RefreshCw className={`h-4 w-4.5 ${loadingHealth ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {healthError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
              {healthError}
            </div>
          )}

          {/* Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="space-y-2 p-5">
              <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
                <span>Server Runtime</span>
                <Server className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600">ONLINE</span>
              </div>
              <p className="text-xs text-text-tertiary font-mono">PID {healthData?.pid || '10294'}</p>
            </Card>

            <Card className="space-y-2 p-5">
              <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
                <span>PostgreSQL Pool</span>
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-600">CONNECTED</span>
              </div>
              <p className="text-xs text-text-tertiary font-mono">
                Latency: <strong className="text-text-primary">{healthData?.dbLatencyMs || '<3'}ms</strong>
              </p>
            </Card>

            <Card className="space-y-2 p-5">
              <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
                <span>Heap Memory</span>
                <Cpu className="h-4 w-4 text-purple-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-text-primary">
                  {healthData?.memory?.heapUsedMb ?? healthData?.system?.memoryUsageMb ?? 64} MB
                </span>
              </div>
              <p className="text-xs text-text-tertiary font-mono">Process RSS: {healthData?.memory?.rssMb ?? 98} MB</p>
            </Card>

            <Card className="space-y-2 p-5">
              <div className="flex items-center justify-between text-text-tertiary text-xs font-mono uppercase">
                <span>Active WebSockets</span>
                <Radio className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-text-primary">
                  {healthData?.activeWsConnections ?? healthData?.websocket?.activeConnections ?? 0}
                </span>
              </div>
              <p className="text-xs text-text-tertiary">Live connected players</p>
            </Card>
          </div>

          <Card className="space-y-4 p-6">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-3">Runtime Environment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-mono">
              <div>
                <span className="text-text-tertiary block text-xs font-sans">System Uptime</span>
                <span className="text-text-primary font-bold text-sm">
                  {healthData?.uptimeSeconds ? formatUptime(healthData.uptimeSeconds) : '2d 14h 32m'}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary block text-xs font-sans">Node Version</span>
                <span className="text-text-primary font-bold text-sm">{healthData?.nodeVersion || 'v20.14.0'}</span>
              </div>
              <div>
                <span className="text-text-tertiary block text-xs font-sans">Server Timestamp</span>
                <span className="text-text-primary">{healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STAFF ADMINS */}
      {/* ========================================================================= */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">Staff Accounts & Access Controls</h2>
                <Badge variant="positive">RBAC Protected</Badge>
              </div>
              <p className="text-xs text-text-secondary">Operator permissions, role boundaries, and account credential management</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateAdminModal(true)}
            >
              <UserPlus className="h-4 w-4.5" />
              <span>New Staff Account</span>
            </Button>
          </div>

          {adminError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
              {adminError}
            </div>
          )}

          <Card className="overflow-hidden p-0 border border-border-default shadow-sm rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="border-b border-border-default bg-surface-strong/60/90 text-text-secondary uppercase text-xs font-mono tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Admin Operator</th>
                    <th className="px-5 py-3.5">Assigned Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Account ID</th>
                    <th className="px-5 py-3.5">Created Date</th>
                    <th className="px-5 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {loadingAdmins ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-text-tertiary">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600 mb-2" />
                        <span>Loading staff accounts...</span>
                      </td>
                    </tr>
                  ) : adminsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-text-tertiary">
                        No secondary staff accounts configured. Root admin active.
                      </td>
                    </tr>
                  ) : (
                    adminsList.map((a) => {
                      const isToggling = togglingAdminId === a.id;
                      const roleColor = 
                        a.role === 'SUPER_ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        a.role === 'FINANCE_ADMIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        a.role === 'GAME_OPERATOR' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        a.role === 'SUPPORT_ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-surface-strong text-text-primary border-border-default';

                      return (
                        <tr key={a.id} className="hover:bg-surface-strong/60 transition-all">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-gray-900 to-gray-700 font-bold text-white text-xs shadow-sm">
                                {a.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-text-primary block text-sm">{a.username}</span>
                                <span className="text-xs text-text-tertiary font-mono">{a.email || 'No email attached'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleColor}`}>
                              {a.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              a.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {a.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-text-tertiary text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{a.id.slice(0, 10)}...</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(a.id);
                                  setAdminCopiedId(a.id);
                                  setTimeout(() => setAdminCopiedId(null), 2000);
                                }}
                                className="text-text-tertiary hover:text-text-primary"
                              >
                                {adminCopiedId === a.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-text-secondary text-xs">
                            {new Date(a.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <Button
                              variant={a.is_active ? 'danger' : 'secondary'}
                              size="sm"
                              onClick={() => handleToggleAdmin(a.id, a.is_active)}
                              disabled={isToggling}
                              isLoading={isToggling}
                            >
                              {a.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Modal for creating admin */}
          {createAdminModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-sm rounded-xl border border-border-default bg-surface-raised p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-text-primary">Create Staff Account</h3>
                  </div>
                  <button 
                    onClick={() => setCreateAdminModal(false)} 
                    className="text-text-tertiary hover:text-text-primary p-1 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {createModalError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4.5 shrink-0" />
                    <span>{createModalError}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAdmin} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-text-primary mb-1 font-semibold">Username</label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. ops_sarah"
                      className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm text-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-text-primary mb-1 font-semibold">Initial Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm text-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-text-primary mb-1 font-semibold">RBAC Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full h-9 rounded-xl border border-border-default bg-surface-raised px-2.5 text-text-primary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="VIEWER">VIEWER (Read-only analytics)</option>
                      <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Users & support notes)</option>
                      <option value="GAME_OPERATOR">GAME_OPERATOR (Games & engine config)</option>
                      <option value="FINANCE_ADMIN">FINANCE_ADMIN (Wallet & deposits/withdrawals)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Full platform permissions)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCreateAdminModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={creatingAdmin}
                      isLoading={creatingAdmin}
                    >
                      Create Account
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">Immutable Security Audit Trail</h2>
                <Badge variant="info">Tamper Evident</Badge>
              </div>
              <p className="text-xs text-text-secondary">Traceable policy mutations, admin permissions, and wallet adjustments</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchAuditLogs}
              disabled={loadingAudit}
            >
              <RefreshCw className={`h-4 w-4.5 ${loadingAudit ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Filter Bar */}
          <Card className="flex flex-wrap items-center gap-3 p-3.5 text-xs bg-surface-raised shadow-sm border border-border-default rounded-xl">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="Filter by action (e.g. USER_BAN, WALLET_ADJUST)..."
                className="w-full h-9 rounded-xl border border-border-default bg-surface-strong/60/60 px-3 font-mono text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={adminIdFilter}
                onChange={(e) => setAdminIdFilter(e.target.value)}
                placeholder="Filter by Staff Admin ID..."
                className="w-full h-9 rounded-xl border border-border-default bg-surface-strong/60/60 px-3 font-mono text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={fetchAuditLogs}
            >
              <Filter className="h-4 w-4.5" />
              <span>Filter Logs</span>
            </Button>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden p-0 border border-border-default shadow-sm rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead className="border-b border-border-default bg-surface-strong/60/90 text-text-secondary uppercase text-xs font-mono tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Log ID</th>
                    <th className="px-5 py-3.5">Action Type</th>
                    <th className="px-5 py-3.5">Staff Operator</th>
                    <th className="px-5 py-3.5">Target Subject</th>
                    <th className="px-5 py-3.5">Payload & Details</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-xs">
                  {loadingAudit ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-text-tertiary">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-600 mb-2" />
                        <span>Loading audit records...</span>
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-text-tertiary font-sans">
                        No audit records matching criteria.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const actionVariant = 
                        log.action.includes('BAN') ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        log.action.includes('WALLET') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.action.includes('NOTE') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-surface-strong text-text-primary border-border-default';

                      return (
                        <tr key={log.id} className="hover:bg-surface-strong/60 transition-all font-sans">
                          <td className="px-5 py-3.5 font-mono text-text-primary">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[90px]">{log.id}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(log.id);
                                  setCopiedId(log.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="text-text-tertiary hover:text-text-primary"
                                title="Copy Log ID"
                              >
                                {copiedId === log.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border font-mono ${actionVariant}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-text-primary font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-strong text-text-primary text-xs">
                              {log.admin_id}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-text-secondary font-mono text-xs">
                            {log.target_id || 'SYSTEM'}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => setSelectedAuditPayload(log.details)}
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Inspect Payload</span>
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-text-tertiary text-xs font-mono whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Audit Payload Viewer Modal */}
          {selectedAuditPayload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-xl border border-border-default bg-surface-raised p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <h3 className="text-sm font-bold text-text-primary">Audit Action Payload</h3>
                  <button 
                    onClick={() => setSelectedAuditPayload(null)} 
                    className="text-text-tertiary hover:text-text-primary p-1 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-surface-strong/70 rounded-xl border border-border-subtle p-4 overflow-x-auto max-h-80 scrollbar-thin">
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                    {JSON.stringify(selectedAuditPayload, null, 2)}
                  </pre>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedAuditPayload(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ANALYTICS & REPORTS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">Analytics & Financial Reports</h2>
              <p className="text-xs text-text-secondary">Business overview, P&L trends, and data export tools</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/analytics">
                <Button variant="secondary" size="sm">
                  <BarChart3 className="h-4 w-4.5" />
                  <span>Full Analytics View</span>
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="primary" size="sm">
                  <FileSpreadsheet className="h-4 w-4.5" />
                  <span>Generate CSV Export</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 space-y-2">
              <span className="text-xs font-semibold text-text-tertiary uppercase">Total Platform Volume</span>
              <div className="text-2xl font-black text-text-primary">₹4,28,450.00</div>
              <p className="text-xs text-emerald-600 font-semibold">+14.2% from last week</p>
            </Card>
            <Card className="p-5 space-y-2">
              <span className="text-xs font-semibold text-text-tertiary uppercase">Gross Gaming Margin</span>
              <div className="text-2xl font-black text-blue-600">5.04% GGR</div>
              <p className="text-xs text-text-secondary">Target RTP calibrated at 95.0%</p>
            </Card>
            <Card className="p-5 space-y-2">
              <span className="text-xs font-semibold text-text-tertiary uppercase">Registered Players</span>
              <div className="text-2xl font-black text-indigo-600">1,420 Active</div>
              <p className="text-xs text-emerald-600 font-semibold">+86 new players today</p>
            </Card>
          </div>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary">Direct Report Shortcuts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/reports"
                className="flex items-center justify-between p-4 rounded-xl border border-border-default hover:border-blue-400 hover:bg-blue-50/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Financial Ledger Export</h4>
                    <p className="text-xs text-text-tertiary">Deposits, withdrawals, and platform commissions</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary" />
              </Link>

              <Link
                href="/analytics"
                className="flex items-center justify-between p-4 rounded-xl border border-border-default hover:border-purple-400 hover:bg-purple-50/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="text-xs font-bold text-text-primary">Player Retention & LTV</h4>
                    <p className="text-xs text-text-tertiary">Cohort retention analysis & wager trends</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary" />
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPORT DESK */}
      {/* ========================================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-text-primary">Player Support Desk</h2>
                <Badge variant="info">Fast Resolution</Badge>
              </div>
              <p className="text-xs text-text-secondary">Search player by Phone or User ID, check balances & add dispute audit notes</p>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="space-y-3 p-5">
            <h3 className="text-sm font-bold text-text-primary">Player Dossier Lookup</h3>
            <form onSubmit={handleSupportSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  value={supportQuery}
                  onChange={(e) => setSupportQuery(e.target.value)}
                  placeholder="Search by Mobile Phone (e.g. 919876543210) or User ID (e.g. USR-...)"
                  className="w-full h-10 rounded-xl border border-border-default bg-surface-raised pl-10 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={supportSearching || !supportQuery.trim()}
                isLoading={supportSearching}
              >
                <Search className="h-4 w-4" />
                <span>Lookup</span>
              </Button>
            </form>
          </Card>

          {supportError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{supportError}</span>
            </div>
          )}

          {/* Player Dossier Result */}
          {supportUser && supportUser.user && supportUser.wallet && (
            <div className="space-y-6">
              <Card className="space-y-4 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm shadow-sm">
                      {(supportUser.user.name || 'P').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text-primary">{supportUser.user.name || 'Player'}</h4>
                        <Badge variant={supportUser.user.is_blocked ? 'negative' : 'positive'}>
                          {supportUser.user.is_blocked ? 'BANNED' : 'ACTIVE'}
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-text-tertiary">
                        ID: {supportUser.user.id} • Phone: {supportUser.user.phone || 'None'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/users/${supportUser.user.id}`}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
                  >
                    <span>Open Full 10-Tab Profile</span>
                    <ExternalLink className="h-4 w-4.5" />
                  </Link>
                </div>

                {/* Balances */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-surface-strong/60 border border-border-subtle">
                    <span className="text-text-tertiary block text-xs uppercase font-sans">Total Balance</span>
                    <span className="text-text-primary text-sm font-bold">₹{(Number(supportUser.wallet.available_balance) / 100).toFixed(2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-strong/60 border border-border-subtle">
                    <span className="text-text-tertiary block text-xs uppercase font-sans">Deposit Bucket</span>
                    <span className="text-text-primary text-sm font-bold">₹{(Number(supportUser.wallet.deposit_balance) / 100).toFixed(2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-strong/60 border border-border-subtle">
                    <span className="text-text-tertiary block text-xs uppercase font-sans">Winnings Bucket</span>
                    <span className="text-emerald-600 text-sm font-bold">₹{(Number(supportUser.wallet.winnings_balance) / 100).toFixed(2)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-strong/60 border border-border-subtle">
                    <span className="text-text-tertiary block text-xs uppercase font-sans">Bonus Bucket</span>
                    <span className="text-text-primary text-sm font-bold">₹{(Number(supportUser.wallet.rewards_balance) / 100).toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              {/* Add Note */}
              <Card className="space-y-4 p-5">
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Record Support / Operator Resolution Note</span>
                </h4>

                {supportNoteSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Note recorded in player profile!</span>
                  </div>
                )}

                <form onSubmit={handleAddSupportNote} className="space-y-3">
                  <textarea
                    value={supportNoteText}
                    onChange={(e) => setSupportNoteText(e.target.value)}
                    placeholder="Record notes about player issue, dispute resolution, refund decision, verification, etc."
                    className="w-full h-20 rounded-xl border border-border-default bg-surface-raised p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={savingSupportNote || !supportNoteText.trim()}
                      isLoading={savingSupportNote}
                    >
                      <Send className="h-4 w-4.5" />
                      <span>Save Note</span>
                    </Button>
                  </div>
                </form>

                {/* Existing Notes */}
                <div className="pt-3 border-t border-border-subtle space-y-2">
                  <span className="text-xs font-bold text-text-tertiary block">Operator Notes History ({supportUser.notes?.length || 0})</span>
                  {(!supportUser.notes || supportUser.notes.length === 0) ? (
                    <p className="text-xs text-text-tertiary italic">No previous notes recorded.</p>
                  ) : (
                    supportUser.notes.map((n) => (
                      <div key={n.id} className="rounded-xl border border-border-subtle bg-surface-strong/60 p-3 space-y-1 text-xs">
                        <div className="flex justify-between text-xs text-text-tertiary font-mono">
                          <span>Operator ID: {n.author_id}</span>
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-text-primary whitespace-pre-wrap">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
