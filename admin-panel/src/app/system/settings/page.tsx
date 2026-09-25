'use client';
import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { adminService } from '@/services/adminService';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Global Platform Settings</h1>
            <span className="rounded-full bg-[#2988ff]/10 px-2 py-0.5 text-[10.5px] font-mono text-[#2988ff] border border-[#2988ff]/20">
              Database Synced
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative platform risk bounds, limits and alert routing</p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex h-8 items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-3 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] transition-all"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#2988ff]' : 'text-[#8c8c8c]'}`} />
          <span>Sync</span>
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-[6px] border border-emerald-500/20 bg-emerald-500/10 p-3 text-[12px] text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: RTP Target Config */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Target Return to Player (RTP)</h3>
              <p className="text-[11px] text-[#8c8c8c]">Calibrated mathematical house margin</p>
            </div>
            <span className="font-mono text-[12px] text-emerald-400 font-bold">{rtpTarget}%</span>
          </div>

          <div className="space-y-2">
            <label className="block text-[12px] text-[#a6a6a6]">RTP Percentage (90% - 98%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="90"
                max="98"
                value={rtpTarget}
                onChange={(e) => setRtpTarget(e.target.value)}
                className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] text-[12px] focus:border-[#2988ff] focus:outline-none"
              />
              <button
                onClick={() => handleSaveSetting('rtp_target_percent', parseFloat(rtpTarget), 'Updated RTP target percentage')}
                disabled={savingKey === 'rtp_target_percent'}
                className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
              >
                {savingKey === 'rtp_target_percent' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Bet Constraints */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Betting Range Bounds</h3>
              <p className="text-[11px] text-[#8c8c8c]">Minimum & maximum wager constraints</p>
            </div>
            <span className="font-mono text-[12px] text-[#2988ff] font-bold">₹{minBet} - ₹{maxBet}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <label className="block text-[#a6a6a6] mb-1">Min Bet (₹)</label>
              <input
                type="number"
                min="1"
                value={minBet}
                onChange={(e) => setMinBet(e.target.value)}
                className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#a6a6a6] mb-1">Max Bet (₹)</label>
              <input
                type="number"
                min="10"
                value={maxBet}
                onChange={(e) => setMaxBet(e.target.value)}
                className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                handleSaveSetting('bet_min_limit', parseFloat(minBet), 'Updated minimum bet limit');
                handleSaveSetting('bet_max_limit', parseFloat(maxBet), 'Updated maximum bet limit');
              }}
              disabled={Boolean(savingKey)}
              className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3 py-1 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
            >
              <Save className="h-3 w-3" />
              <span>Save Limits</span>
            </button>
          </div>
        </div>

        {/* Card 3: Global Maintenance Mode */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Emergency Maintenance Mode</h3>
              <p className="text-[11px] text-[#8c8c8c]">Pause gameplay and payment processing globally</p>
            </div>
            <span className={`font-mono text-[12px] font-bold ${maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
              {maintenanceMode ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] text-[#a6a6a6]">Toggle Platform Maintenance:</span>
            <button
              onClick={() => {
                const nextVal = !maintenanceMode;
                setMaintenanceMode(nextVal);
                handleSaveSetting('maintenance_mode', nextVal, `Toggled maintenance mode to ${nextVal}`);
              }}
              className={`rounded-[4px] border px-3 py-1.5 text-[12px] font-medium transition-all ${
                maintenanceMode
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                  : 'border-white/[0.08] bg-black text-[#8c8c8c] hover:text-[#e1e1e1]'
              }`}
            >
              {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
            </button>
          </div>
        </div>

        {/* Card 4: Telegram Alerts Channel */}
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Telegram Security Alerts</h3>
              <p className="text-[11px] text-[#8c8c8c]">High-value deposit & withdrawal alerts</p>
            </div>
            <span className={`font-mono text-[12px] font-bold ${telegramAlerts ? 'text-emerald-400' : 'text-[#8c8c8c]'}`}>
              {telegramAlerts ? 'ENABLED' : 'MUTED'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[12px] text-[#a6a6a6]">Push Alerts to Telegram:</span>
            <button
              onClick={() => {
                const nextVal = !telegramAlerts;
                setTelegramAlerts(nextVal);
                handleSaveSetting('telegram_alerts_enabled', nextVal, `Toggled telegram alerts to ${nextVal}`);
              }}
              className={`rounded-[4px] border px-3 py-1.5 text-[12px] font-medium transition-all ${
                telegramAlerts
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                  : 'border-white/[0.08] bg-black text-[#8c8c8c] hover:text-[#e1e1e1]'
              }`}
            >
              {telegramAlerts ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
