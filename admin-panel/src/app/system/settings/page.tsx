'use client';
import React, { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for editable settings
  const [rtpTarget, setRtpTarget] = useState('95.0');
  const [minBet, setMinBet] = useState('10');
  const [maxBet, setMaxBet] = useState('10000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [telegramAlerts, setTelegramAlerts] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
        if (res.data.rtp_target_percent !== undefined) setRtpTarget(res.data.rtp_target_percent.toString());
        if (res.data.bet_min_limit !== undefined) setMinBet(res.data.bet_min_limit.toString());
        if (res.data.bet_max_limit !== undefined) setMaxBet(res.data.bet_max_limit.toString());
        if (res.data.maintenance_mode !== undefined) setMaintenanceMode(Boolean(res.data.maintenance_mode));
        if (res.data.telegram_alerts_enabled !== undefined) setTelegramAlerts(Boolean(res.data.telegram_alerts_enabled));
      }
    } catch (err: any) {
      console.error('Fetch settings error:', err);
      setError(err.response?.data?.message || err.message || 'Error loading platform settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSetting = async (key: string, value: any, description: string) => {
    try {
      setSavingKey(key);
      setError(null);
      setSuccessMsg(null);
      const res = await adminService.updateSetting(key, value, description);
      if (res.success) {
        setSuccessMsg(`Setting '${key}' saved successfully!`);
        await fetchSettings();
      } else {
        setError(res.message || `Failed to update ${key}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Setting update failed');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Global Platform Settings</h1>
            <Badge variant="info">Database Synced</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Authoritative platform risk bounds, limits and alert routing</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchSettings}
          disabled={loading}
          aria-label="Sync platform settings"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
          <span>Sync</span>
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-md border border-status-positive/20 bg-status-positive/10 p-3 text-xs text-status-positive">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: RTP Target Config */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Target Return to Player (RTP)</h3>
              <p className="text-xs text-text-tertiary">Calibrated mathematical house margin</p>
            </div>
            <Badge variant="positive">{rtpTarget}%</Badge>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-text-secondary">RTP Percentage (90% - 98%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="90"
                max="98"
                value={rtpTarget}
                onChange={(e) => setRtpTarget(e.target.value)}
                className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 font-mono text-text-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveSetting('rtp_target_percent', parseFloat(rtpTarget), 'Updated RTP target percentage')}
                disabled={savingKey === 'rtp_target_percent'}
                isLoading={savingKey === 'rtp_target_percent'}
              >
                <Save className="h-3 w-3" />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 2: Bet Constraints */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Betting Range Bounds</h3>
              <p className="text-xs text-text-tertiary">Minimum & maximum wager constraints</p>
            </div>
            <Badge variant="info">₹{minBet} - ₹{maxBet}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-text-secondary mb-1">Min Bet (₹)</label>
              <input
                type="number"
                min="1"
                value={minBet}
                onChange={(e) => setMinBet(e.target.value)}
                className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-1">Max Bet (₹)</label>
              <input
                type="number"
                min="10"
                value={maxBet}
                onChange={(e) => setMaxBet(e.target.value)}
                className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
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
              <Save className="h-3 w-3" />
              <span>Save Limits</span>
            </Button>
          </div>
        </Card>

        {/* Card 3: Global Maintenance Mode */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Emergency Maintenance Mode</h3>
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
          <div className="flex items-center justify-between border-b border-border-muted pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Telegram Security Alerts</h3>
              <p className="text-xs text-text-tertiary">High-value deposit & withdrawal alerts</p>
            </div>
            <Badge variant={telegramAlerts ? 'positive' : 'neutral'}>
              {telegramAlerts ? 'ENABLED' : 'MUTED'}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-text-secondary">Push Alerts to Telegram:</span>
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
  );
}
