'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Gamepad2,
  Activity,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function GameDetailsPage() {
  const params = useParams();
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
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-primary" />
          <p className="text-xs text-text-tertiary font-mono">Syncing runtime engine telemetry...</p>
        </div>
      </div>
    );
  }

  if (error && !game) {
    return (
      <div className="space-y-4">
        <Link href="/games" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Games
        </Link>
        <div className="rounded-lg border border-status-negative/20 bg-status-negative/10 p-4 text-xs text-status-negative">
          {error}
        </div>
      </div>
    );
  }

  const isRingOfFuture = game?.slug === 'ring-of-future' || game?.id === 'ring_of_future';
  const isXoBattle = game?.slug === 'xo-battle' || game?.id === 'xo_battle' || game?.id === 'tic_tac_toe';
  const runtime = game?.runtimeStatus || game?.runtime || {};
  const stats = game?.stats || {};

  const totalBets = Number(stats.totalBets || 0);
  const totalWageredPaise = Number(stats.totalWageredPaise || 0);
  const totalPayoutsPaise = Number(stats.totalPayoutsPaise || 0);
  const ggrPaise = totalWageredPaise - totalPayoutsPaise;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border-default pb-5">
        <Link href="/games" className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-primary transition-fast w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">{game?.name || game?.game?.name}</h1>
                <Badge
                  variant={
                    (game?.status || game?.game?.status) === 'LIVE' ? 'positive' : (game?.status || game?.game?.status) === 'MAINTENANCE' ? 'warning' : 'neutral'
                  }
                >
                  {game?.status || game?.game?.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary mt-1">
                <span>Slug: {game?.slug || game?.game?.slug}</span>
                <span>•</span>
                <span>Engine: {game?.type || game?.game?.type || 'Multiplayer P2P'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-status-positive/20 bg-status-positive/10 p-3 text-xs text-status-positive">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Game Financial & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-raised border border-border-default">
          <span className="text-xs uppercase tracking-wider text-text-tertiary block font-semibold">Total Wagers</span>
          <span className="text-xl font-bold font-mono text-text-primary mt-1 block">{totalBets}</span>
          <span className="text-xs text-text-tertiary mt-0.5 block">Player Bets Placed</span>
        </Card>
        <Card className="p-4 bg-surface-raised border border-border-default">
          <span className="text-xs uppercase tracking-wider text-text-tertiary block font-semibold">Volume Wagered</span>
          <span className="text-xl font-bold font-mono text-accent-primary mt-1 block">₹{(totalWageredPaise / 100).toFixed(2)}</span>
          <span className="text-xs text-text-tertiary mt-0.5 block">Total turnover</span>
        </Card>
        <Card className="p-4 bg-surface-raised border border-border-default">
          <span className="text-xs uppercase tracking-wider text-text-tertiary block font-semibold">Prizes Paid</span>
          <span className="text-xl font-bold font-mono text-status-warning mt-1 block">₹{(totalPayoutsPaise / 100).toFixed(2)}</span>
          <span className="text-xs text-text-tertiary mt-0.5 block">Win payouts</span>
        </Card>
        <Card className="p-4 bg-surface-raised border border-border-default">
          <span className="text-xs uppercase tracking-wider text-text-tertiary block font-semibold">Gross Gaming Rev</span>
          <span className={`text-xl font-bold font-mono mt-1 block ${ggrPaise >= 0 ? 'text-status-positive' : 'text-status-negative'}`}>
            ₹{(ggrPaise / 100).toFixed(2)}
          </span>
          <span className="text-xs text-text-tertiary mt-0.5 block">House GGR (Margin)</span>
        </Card>
      </div>

      {/* Runtime Telemetry Card (If Ring of Future is live) */}
      {isRingOfFuture && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Ring of Future Engine Telemetry</h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-status-positive/10 px-2.5 py-0.5 text-xs font-mono text-status-positive border border-status-positive/20">
              <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse" />
              Engine Running
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Engine State</span>
              <span className="text-status-positive text-base font-bold uppercase">{runtime.phase || runtime.engineState?.state || 'ACTIVE'}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Current Round</span>
              <span className="text-text-primary text-base font-bold">#{runtime.currentRound || runtime.roundCount || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Phase Time Left</span>
              <span className="text-accent-primary text-base font-bold">{runtime.secondsRemaining ?? runtime.engineState?.timeLeft ?? 0}s</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Active Sockets</span>
              <span className="text-text-primary text-base font-bold">{runtime.connectedPlayers || 0}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Runtime Telemetry Card (If XO Battle is active) */}
      {isXoBattle && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-primary" />
              <h2 className="text-sm font-semibold text-text-primary">XO 1v1 Battle Engine Telemetry</h2>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-status-positive/10 px-2.5 py-0.5 text-xs font-mono text-status-positive border border-status-positive/20">
              <span className="h-1.5 w-1.5 rounded-full bg-status-positive animate-pulse" />
              Multiplayer Matchmaker Online
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Engine Status</span>
              <span className="text-status-positive text-base font-bold uppercase">{runtime.isRunning ? 'RUNNING' : 'ONLINE'}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Active Battle Rooms</span>
              <span className="text-text-primary text-base font-bold">{runtime.activeRooms || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Active Stake Tiers</span>
              <span className="text-accent-primary text-base font-bold">{runtime.availableTiers || 5} Tiers (₹1-₹100)</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-base border border-border-subtle">
              <span className="text-text-tertiary block text-xs uppercase font-sans">Connected Players</span>
              <span className="text-text-primary text-base font-bold">{runtime.connectedPlayers || 0}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Fairness & Invariants Safeguard Notice */}
      <Card variant="subtle" className="space-y-2">
        <div className="flex items-center gap-2 text-status-positive text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Fair Play & House Rigging Invariant (Hard Rule 9 & 10)</span>
        </div>
        <p className="text-xs text-text-tertiary leading-relaxed">
          In strict compliance with Bit Arcade Game Platform Invariants, all wheel RNG outcomes are cryptographically generated on the server using authoritative CSPRNG. House rigging, outcome injection, and client-side manipulation are strictly barred by backend code and rejected at the API layer.
        </p>
      </Card>

      {/* Configuration Form */}
      <Card as="form" onSubmit={handleSaveConfig} className="space-y-5">
        <h2 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-3">
          Runtime Parameters & Timing
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-text-secondary mb-1.5 font-medium">Betting Phase Duration (Seconds)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={bettingDuration}
              onChange={(e) => setBettingDuration(e.target.value)}
              className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
            <span className="text-xs text-text-tertiary mt-1 block">Default: 15s. Range: 5s - 120s.</span>
          </div>

          <div>
            <label className="block text-text-secondary mb-1.5 font-medium">Result Display Duration (Seconds)</label>
            <input
              type="number"
              min="2"
              max="30"
              value={resultDisplayDuration}
              onChange={(e) => setResultDisplayDuration(e.target.value)}
              className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
            <span className="text-xs text-text-tertiary mt-1 block">Default: 5s. Range: 2s - 30s.</span>
          </div>
        </div>

        <div>
          <label className="block text-text-secondary mb-1.5 font-medium">Maintenance Banner Message (Optional)</label>
          <input
            type="text"
            value={maintenanceBanner}
            onChange={(e) => setMaintenanceBanner(e.target.value)}
            placeholder="e.g. Scheduled maintenance window in progress. Game resumes shortly."
            className="w-full h-10 rounded-lg border border-border-default bg-surface-strong/60 px-3.5 text-sm text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-border-subtle">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            isLoading={saving}
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </Card>

    </div>
  );
}
