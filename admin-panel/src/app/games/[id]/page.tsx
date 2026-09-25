'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Gamepad2,
  Activity,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  Clock,
  Users,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function GameDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form config state
  const [bettingDuration, setBettingDuration] = useState('15');
  const [resultDisplayDuration, setResultDisplayDuration] = useState('5');
  const [maintenanceBanner, setMaintenanceBanner] = useState('');

  const fetchGame = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getGameDetails(gameId);
      if (res.success && res.data) {
        setGame(res.data);
        const cfg = res.data.config || {};
        if (cfg.bettingDuration) setBettingDuration(cfg.bettingDuration.toString());
        if (cfg.resultDisplayDuration) setResultDisplayDuration(cfg.resultDisplayDuration.toString());
        if (cfg.maintenanceBanner) setMaintenanceBanner(cfg.maintenanceBanner);
      } else {
        setError(res.message || 'Game not found');
      }
    } catch (err: any) {
      console.error('Fetch game error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const bDur = parseInt(bettingDuration, 10);
    const rDur = parseInt(resultDisplayDuration, 10);

    if (isNaN(bDur) || bDur < 5 || bDur > 120) {
      setError('Betting duration must be between 5 and 120 seconds');
      setSaving(false);
      return;
    }

    if (isNaN(rDur) || rDur < 2 || rDur > 30) {
      setError('Result display duration must be between 2 and 30 seconds');
      setSaving(false);
      return;
    }

    try {
      const updatedConfig = {
        ...(game?.config || {}),
        bettingDuration: bDur,
        resultDisplayDuration: rDur,
        maintenanceBanner: maintenanceBanner.trim()
      };

      const res = await adminService.updateGameConfig(gameId, updatedConfig);
      if (res.success) {
        setSuccessMsg('Game configuration successfully updated and broadcast to engine!');
        await fetchGame();
      } else {
        setError(res.message || 'Failed to update configuration');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Configuration save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2988ff]" />
          <p className="text-[12px] text-[#8c8c8c] font-mono">Syncing runtime engine telemetry...</p>
        </div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="space-y-4">
        <Link href="/games" className="inline-flex items-center gap-1.5 text-[12px] text-[#8c8c8c] hover:text-[#e1e1e1]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Games
        </Link>
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-4 text-[12px] text-red-400">
          {error}
        </div>
      </div>
    );
  }

  const isRingOfFuture = game?.slug === 'ring-of-future';
  const runtime = game?.runtime || {};

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5">
        <Link href="/games" className="inline-flex items-center gap-1.5 text-[12px] text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Catalog
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">{game?.name}</h1>
                <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium ${
                  game?.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  game?.status === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-white/[0.04] text-[#8c8c8c] border border-white/[0.08]'
                }`}>
                  {game?.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8c8c8c] mt-0.5">
                <span>Slug: {game?.slug}</span>
                <span>•</span>
                <span>Engine: {game?.type}</span>
              </div>
            </div>
          </div>
        </div>
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

      {/* Runtime Telemetry Card (If Ring of Future is live) */}
      {isRingOfFuture && (
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#2988ff]" />
              <h2 className="text-[13px] font-semibold text-[#e1e1e1]">Authoritative Engine Telemetry</h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Running
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] font-mono">
            <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
              <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Engine State</span>
              <span className="text-emerald-400 text-base font-bold uppercase">{runtime.engineState?.state || 'ACTIVE'}</span>
            </div>
            <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
              <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Current Round</span>
              <span className="text-[#e1e1e1] text-base font-bold">#{runtime.engineState?.roundId || runtime.roundCount || 0}</span>
            </div>
            <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
              <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Phase Time Left</span>
              <span className="text-[#2988ff] text-base font-bold">{runtime.engineState?.timeLeft || 0}s</span>
            </div>
            <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
              <span className="text-[#8c8c8c] block text-[10.5px] uppercase">Active Sockets</span>
              <span className="text-[#e1e1e1] text-base font-bold">{runtime.connectedPlayers || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fairness & Invariants Safeguard Notice */}
      <div className="rounded-[8px] border border-white/[0.08] bg-black/40 p-4 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 text-[12px] font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Fair Play & House Rigging Invariant (Hard Rule 9 & 10)</span>
        </div>
        <p className="text-[11.5px] text-[#8c8c8c] leading-relaxed">
          In strict compliance with 334 Game Platform Invariants, all wheel RNG outcomes are cryptographically generated on the server using authoritative CSPRNG. House rigging, outcome injection, and client-side manipulation are strictly barred by backend code and rejected at the API layer.
        </p>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-5">
        <h2 className="text-[13px] font-semibold text-[#e1e1e1] border-b border-white/[0.06] pb-3">
          Runtime Parameters & Timing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[12px]">
          <div>
            <label className="block text-[#a6a6a6] mb-1.5 font-medium">Betting Phase Duration (Seconds)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={bettingDuration}
              onChange={(e) => setBettingDuration(e.target.value)}
              className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
            />
            <span className="text-[11px] text-[#666] mt-1 block">Default: 15s. Range: 5s - 120s.</span>
          </div>

          <div>
            <label className="block text-[#a6a6a6] mb-1.5 font-medium">Result Display Duration (Seconds)</label>
            <input
              type="number"
              min="2"
              max="30"
              value={resultDisplayDuration}
              onChange={(e) => setResultDisplayDuration(e.target.value)}
              className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
            />
            <span className="text-[11px] text-[#666] mt-1 block">Default: 5s. Range: 2s - 30s.</span>
          </div>
        </div>

        <div>
          <label className="block text-[#a6a6a6] mb-1.5 font-medium">Maintenance Banner Message (Optional)</label>
          <input
            type="text"
            value={maintenanceBanner}
            onChange={(e) => setMaintenanceBanner(e.target.value)}
            placeholder="e.g. Scheduled maintenance window in progress. Game resumes shortly."
            className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 text-[12px] text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-white/[0.06]">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-[4px] bg-[#2988ff] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

    </div>
  );
}
