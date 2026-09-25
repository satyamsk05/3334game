'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Gamepad2, 
  RefreshCw, 
  Settings2, 
  Loader2 
} from 'lucide-react';
import { adminService, GameInfo } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function GamesManagementPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || 'ALL';

  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(filterParam.toUpperCase());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const qFilter = searchParams.get('filter');
    if (qFilter) setFilter(qFilter.toUpperCase());
  }, [searchParams]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getGames();
      if (res.success && Array.isArray(res.data)) {
        setGames(res.data);
      } else {
        setGames([]);
      }
    } catch (err: any) {
      console.error('Fetch games error:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleStatusChange = async (gameId: string, newStatus: 'LIVE' | 'COMING_SOON' | 'MAINTENANCE') => {
    try {
      setUpdatingId(gameId);
      const res = await adminService.updateGameStatus(gameId, newStatus);
      if (res.success) {
        await fetchGames();
      } else {
        alert(res.message || 'Status change failed');
      }
    } catch (err: any) {
      alert(`Error updating status: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredGames = games.filter((g) => {
    if (filter === 'LIVE') return g.status === 'LIVE';
    if (filter === 'COMING_SOON') return g.status === 'COMING_SOON';
    if (filter === 'MAINTENANCE') return g.status === 'MAINTENANCE';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Game Catalog & Operations</h1>
            <Badge variant="positive">Live Engine Control</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Authoritative catalog routing and real-time state machine configuration</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-md border border-border-default bg-surface-raised p-0.5 text-xs font-medium text-text-secondary">
            {['ALL', 'LIVE', 'COMING_SOON', 'MAINTENANCE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-2.5 py-1 transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                  filter === f
                    ? 'text-text-primary bg-surface-subtle font-semibold shadow-sm'
                    : 'hover:text-text-primary'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={fetchGames}
            disabled={loading}
            aria-label="Sync game instances"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-accent-primary' : 'text-text-tertiary'}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-text-tertiary">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-primary mb-2" />
            <span>Loading game instances...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <Card className="col-span-full py-16 text-center text-text-tertiary">
            No games found matching the selected filter.
          </Card>
        ) : (
          filteredGames.map((game) => {
            const isUpdating = updatingId === game.id;
            const isLive = game.status === 'LIVE';
            const isMaintenance = game.status === 'MAINTENANCE';

            return (
              <Card
                key={game.id}
                className="group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                        <Gamepad2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary tracking-tight">{game.name}</h3>
                        <span className="text-[10px] font-mono text-text-tertiary">{game.slug}</span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        isLive ? 'positive' : isMaintenance ? 'warning' : 'neutral'
                      }
                    >
                      {game.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-mono border-t border-border-muted pt-3">
                    <div className="flex justify-between text-text-tertiary">
                      <span>Game Engine:</span>
                      <span className="text-text-secondary">{game.type || 'RNG Wheel'}</span>
                    </div>
                    <div className="flex justify-between text-text-tertiary">
                      <span>Display Order:</span>
                      <span className="text-text-secondary">#{game.display_order}</span>
                    </div>
                    <div className="flex justify-between text-text-tertiary">
                      <span>Catalog ID:</span>
                      <span className="text-text-primary truncate max-w-[120px]">{game.id}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border-muted flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={game.status}
                      onChange={(e) => handleStatusChange(game.id, e.target.value as any)}
                      disabled={isUpdating}
                      className="h-7 rounded border border-border-default bg-surface-base px-2 text-xs text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      <option value="LIVE">LIVE</option>
                      <option value="COMING_SOON">COMING SOON</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>

                  <Link href={`/games/${game.id}`}>
                    <Button variant="secondary" size="sm">
                      <Settings2 className="h-3 w-3 text-text-tertiary" />
                      <span>Configure</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>

    </div>
  );
}
