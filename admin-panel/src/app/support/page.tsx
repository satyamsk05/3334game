'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  LifeBuoy,
  Search,
  User,
  Coins,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { adminService, UserDetailsResponse } from '@/services/adminService';

export default function SupportOperationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetailsResponse | null>(null);

  // New note form
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      setError(null);
      setSelectedUser(null);
      setNoteSuccess(false);

      // Search users
      const listRes = await adminService.getUsers({ search: searchQuery.trim(), limit: 1 });
      if (listRes.success && listRes.data?.users?.length > 0) {
        const foundUser = listRes.data.users[0];
        const detailRes = await adminService.getUserDetails(foundUser.id);
        if (detailRes.success && detailRes.data) {
          setSelectedUser(detailRes.data);
        } else {
          setError('User details could not be retrieved');
        }
      } else {
        setError('No player found matching that Phone number or User ID');
      }
    } catch (err: any) {
      console.error('Support search error:', err);
      setError(err.response?.data?.message || err.message || 'Error searching user');
    } finally {
      setSearching(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !noteText.trim()) return;

    try {
      setSavingNote(true);
      setNoteSuccess(false);
      const res = await adminService.addUserNote(selectedUser.user.id, noteText.trim());
      if (res.success) {
        setNoteText('');
        setNoteSuccess(true);
        // Refresh details
        const detailRes = await adminService.getUserDetails(selectedUser.user.id);
        if (detailRes.success) setSelectedUser(detailRes.data);
      } else {
        alert(res.message || 'Failed to save note');
      }
    } catch (err: any) {
      alert(`Error adding note: ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingNote(false);
    }
  };

  const user = selectedUser?.user;
  const wallet = selectedUser?.wallet;
  const notes = selectedUser?.notes || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Support & Player Inquiries</h1>
            <span className="rounded-full bg-[#2988ff]/10 px-2 py-0.5 text-[10.5px] font-mono text-[#2988ff] border border-[#2988ff]/20">
              Staff Desk
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Player resolution lookup, dispute investigation and operator logging</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-3">
        <h2 className="text-[13px] font-semibold text-[#e1e1e1]">Find Player Dossier</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8c8c8c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Mobile Phone (e.g. 919876543210) or User ID (e.g. USR-...)"
              className="w-full h-9 rounded-[4px] border border-white/[0.08] bg-black pl-9 pr-3 text-[12px] text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="flex items-center gap-2 rounded-[4px] bg-[#2988ff] px-4 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Lookup</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/10 p-4 text-[12px] text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Player Dossier Result */}
      {selectedUser && user && wallet && (
        <div className="space-y-6">
          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#2988ff]/10 text-[#2988ff] font-bold">
                  {(user.name || 'P').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#e1e1e1]">{user.name || 'Player'}</h3>
                    {user.is_blocked ? (
                      <span className="rounded-[3px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-400">
                        BANNED
                      </span>
                    ) : (
                      <span className="rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8c8c8c]">
                    ID: {user.id} • Phone: {user.phone || 'None'}
                  </span>
                </div>
              </div>

              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-1 text-[12px] text-[#2988ff] hover:underline"
              >
                <span>Full 10-Tab Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11.5px] font-mono">
              <div className="p-3 rounded-[4px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10px] uppercase">Total Balance</span>
                <span className="text-[#e1e1e1] text-sm font-bold">₹{(Number(wallet.available_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-[4px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10px] uppercase">Deposit Bucket</span>
                <span className="text-[#a6a6a6] text-sm font-bold">₹{(Number(wallet.deposit_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-[4px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10px] uppercase">Winnings Bucket</span>
                <span className="text-emerald-400 text-sm font-bold">₹{(Number(wallet.winnings_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-[4px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[10px] uppercase">Bonus Bucket</span>
                <span className="text-[#a6a6a6] text-sm font-bold">₹{(Number(wallet.rewards_balance) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Add Staff Note */}
          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-[#e1e1e1] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#2988ff]" />
              <span>Record Support Resolution / Operator Note</span>
            </h3>

            {noteSuccess && (
              <div className="flex items-center gap-2 rounded-[4px] border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11.5px] text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Note recorded successfully!</span>
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log details: player dispute, transaction verification, resolution notes..."
                className="w-full h-20 rounded-[4px] border border-white/[0.08] bg-black p-2.5 text-[12px] text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote || !noteText.trim()}
                  className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  <span>Save Note</span>
                </button>
              </div>
            </form>

            {/* Note History */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <span className="text-[11px] font-medium text-[#8c8c8c] block">Existing Support Records ({notes.length})</span>
              {notes.length === 0 ? (
                <p className="text-[12px] text-[#666] italic">No support notes logged yet for this player.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded-[4px] border border-white/[0.06] bg-black/40 p-3 space-y-1">
                    <div className="flex justify-between text-[10.5px] text-[#8c8c8c] font-mono">
                      <span>Staff ID: {n.author_id}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-[12px] text-[#e1e1e1] whitespace-pre-wrap">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
