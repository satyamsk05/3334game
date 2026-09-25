'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { adminService, UserDetailsResponse } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Support & Player Inquiries</h1>
            <Badge variant="info">Staff Desk</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Player resolution lookup, dispute investigation and operator logging</p>
        </div>
      </div>

      {/* Search Input */}
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Find Player Dossier</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Mobile Phone (e.g. 919876543210) or User ID (e.g. USR-...)"
              className="w-full h-9 rounded border border-border-default bg-surface-base pl-9 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={searching || !searchQuery.trim()}
            isLoading={searching}
          >
            <Search className="h-4 w-4" />
            <span>Lookup</span>
          </Button>
        </form>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-status-negative/20 bg-status-negative/10 p-4 text-xs text-status-negative">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Player Dossier Result */}
      {selectedUser && user && wallet && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border-muted pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-primary/10 text-accent-primary font-bold text-sm">
                  {(user.name || 'P').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{user.name || 'Player'}</h3>
                    <Badge variant={user.is_blocked ? 'negative' : 'positive'}>
                      {user.is_blocked ? 'BANNED' : 'ACTIVE'}
                    </Badge>
                  </div>
                  <span className="text-xs font-mono text-text-tertiary">
                    ID: {user.id} • Phone: {user.phone || 'None'}
                  </span>
                </div>
              </div>

              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-1.5 text-xs text-accent-primary hover:underline font-medium"
              >
                <span>Full 10-Tab Profile</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Total Balance</span>
                <span className="text-text-primary text-sm font-bold">₹{(Number(wallet.available_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Deposit Bucket</span>
                <span className="text-text-secondary text-sm font-bold">₹{(Number(wallet.deposit_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Winnings Bucket</span>
                <span className="text-status-positive text-sm font-bold">₹{(Number(wallet.winnings_balance) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded bg-surface-base border border-border-muted">
                <span className="text-text-tertiary block text-[10px] uppercase font-sans">Bonus Bucket</span>
                <span className="text-text-secondary text-sm font-bold">₹{(Number(wallet.rewards_balance) / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Add Staff Note */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent-primary" />
              <span>Record Support Resolution / Operator Note</span>
            </h3>

            {noteSuccess && (
              <div className="flex items-center gap-2 rounded-md border border-status-positive/20 bg-status-positive/10 p-2 text-xs text-status-positive">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Note recorded successfully!</span>
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log details: player dispute, transaction verification, resolution notes..."
                className="w-full h-20 rounded border border-border-default bg-surface-base p-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingNote || !noteText.trim()}
                  isLoading={savingNote}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Save Note</span>
                </Button>
              </div>
            </form>

            {/* Note History */}
            <div className="pt-3 border-t border-border-muted space-y-2">
              <span className="text-xs font-medium text-text-tertiary block">Existing Support Records ({notes.length})</span>
              {notes.length === 0 ? (
                <p className="text-xs text-text-tertiary italic">No support notes logged yet for this player.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="rounded border border-border-muted bg-surface-base p-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-text-tertiary font-mono">
                      <span>Staff ID: {n.author_id}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-text-primary whitespace-pre-wrap">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
