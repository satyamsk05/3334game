'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Gamepad2, 
  PlayCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Loader2, 
  Settings2,
  RefreshCw
} from 'lucide-react';
import { adminService, GameInfo } from '@/services/adminService';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Game Catalog & Operations</h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-mono text-emerald-400 border border-emerald-500/20">
              Live Engine Control
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative catalog routing and real-time state machine configuration</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center rounded-[4px] border border-white/[0.08] bg-[#212123] p-0.5 text-[11px] font-medium text-[#a6a6a6]">
            {['ALL', 'LIVE', 'COMING_SOON', 'MAINTENANCE'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-[3px] px-2.5 py-1 transition-all ${
                  filter === f
                    ? 'text-[#e1e1e1] bg-white/[0.08] font-semibold shadow-sm'
                    : 'hover:text-[#e1e1e1]'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={fetchGames}
            disabled={loading}
            className="flex h-8 items-center gap-1.5 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#2988ff]' : 'text-[#8c8c8c]'}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-[#8c8c8c]">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2988ff] mb-2" />
            <span>Loading game instances...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#8c8c8c]">
            No games found matching the selected filter.
          </div>
        ) : (
          filteredGames.map((game) => {
            const isUpdating = updatingId === game.id;
            const isLive = game.status === 'LIVE';
            const isMaintenance = game.status === 'MAINTENANCE';

            return (
              <div
                key={game.id}
                className="group rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20">
                        <Gamepad2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#e1e1e1] tracking-tight">{game.name}</h3>
                        <span className="text-[10px] font-mono text-[#8c8c8c]">{game.slug}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-[3px] text-[10.5px] font-medium font-sans border ${
                      isLive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : isMaintenance
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-white/[0.04] border-white/[0.08] text-[#8c8c8c]'
                    }`}>
                      {game.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-[11.5px] font-mono border-t border-white/[0.04] pt-3">
                    <div className="flex justify-between text-[#8c8c8c]">
                      <span>Game Engine:</span>
                      <span className="text-[#a6a6a6]">{game.type || 'RNG Wheel'}</span>
                    </div>
                    <div className="flex justify-between text-[#8c8c8c]">
                      <span>Display Order:</span>
                      <span className="text-[#a6a6a6]">#{game.display_order}</span>
                    </div>
                    <div className="flex justify-between text-[#8c8c8c]">
                      <span>Catalog ID:</span>
                      <span className="text-[#e1e1e1] truncate max-w-[120px]">{game.id}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <select
                      value={game.status}
                      onChange={(e) => handleStatusChange(game.id, e.target.value as any)}
                      disabled={isUpdating}
                      className="h-7 rounded-[4px] border border-white/[0.08] bg-black px-2 text-[11px] text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                    >
                      <option value="LIVE">LIVE</option>
                      <option value="COMING_SOON">COMING SOON</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>

                  <Link
                    href={`/games/${game.id}`}
                    className="flex items-center gap-1 rounded-[4px] border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11.5px] font-medium text-[#a6a6a6] hover:text-[#e1e1e1] hover:border-white/20 transition-all"
                  >
                    <Settings2 className="h-3.5 w-3.5 text-[#8c8c8c]" />
                    <span>Configure</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
