'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Coins,
  ShieldAlert,
  ShieldCheck,
  User,
  History,
  FileText,
  CreditCard,
  Gamepad2,
  Lock,
  PlusCircle,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  X
} from 'lucide-react';
import { adminService, UserDetailsResponse } from '@/services/adminService';

type TabKey =
  | 'overview'
  | 'wallet'
  | 'transactions'
  | 'deposits'
  | 'withdrawals'
  | 'games'
  | 'activity'
  | 'security'
  | 'notes'
  | 'audit';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [data, setData] = useState<UserDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Note form state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Wallet adjustment modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustBucket, setAdjustBucket] = useState<'deposit' | 'winnings' | 'bonus'>('deposit');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUserDetails(userId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Player details not found');
      }
    } catch (err: any) {
      console.error('Fetch user detail error:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBan = async () => {
    if (!data?.user) return;
    const isCurrentlyBlocked = data.user.is_blocked;
    let reason = '';
    if (!isCurrentlyBlocked) {
      const input = window.prompt('Enter reason for suspension / ban:', 'Platform policy violation');
      if (input === null) return;
      reason = input.trim();
    } else {
      if (!window.confirm('Are you sure you want to lift this player suspension?')) return;
    }

    try {
      const res = await adminService.toggleBan(userId, !isCurrentlyBlocked, reason);
      if (res.success) {
        await fetchDetails();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err: any) {
      alert(`Action error: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setAddingNote(true);
      const res = await adminService.addUserNote(userId, newNote.trim());
      if (res.success) {
        setNewNote('');
        await fetchDetails();
      } else {
        alert(res.message || 'Failed to add note');
      }
    } catch (err: any) {
      alert(`Failed to add note: ${err.response?.data?.message || err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);
    const amountNum = parseFloat(adjustAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setAdjustError('Please specify a valid positive amount in ₹');
      return;
    }
    if (!adjustReason.trim() || adjustReason.trim().length < 5) {
      setAdjustError('A mandatory reason (at least 5 characters) is required for audit logs');
      return;
    }

    try {
      setAdjustSubmitting(true);
      const res = await adminService.adjustUserWallet(userId, {
        bucket: adjustBucket,
        type: adjustType,
        amountRupees: amountNum,
        reason: adjustReason.trim()
      });
      if (res.success) {
        setAdjustModalOpen(false);
        setAdjustAmount('');
        setAdjustReason('');
        await fetchDetails();
      } else {
        setAdjustError(res.message || 'Adjustment failed');
      }
    } catch (err: any) {
      setAdjustError(err.response?.data?.message || err.message || 'Wallet adjustment error');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#2988ff]" />
          <p className="text-[12px] text-[#8c8c8c] font-mono">Loading authoritative user dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-[12px] text-[#8c8c8c] hover:text-[#e1e1e1]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Player Directory
        </Link>
        <div className="flex items-center gap-2 rounded-[6px] border border-red-500/20 bg-red-500/10 p-4 text-[12px] text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error || 'Player record not found'}</span>
        </div>
      </div>
    );
  }

  const { user, wallet, metrics, recentTransactions, recentBets, deposits, withdrawals, notes, auditTrail } = data;

  const depositRupees = Number(wallet.deposit_balance || 0) / 100;
  const winningsRupees = Number(wallet.winnings_balance || 0) / 100;
  const bonusRupees = Number(wallet.rewards_balance || 0) / 100;
  const availableRupees = Number(wallet.available_balance || 0) / 100;
  const totalDepositedRupees = Number(wallet.total_deposited || 0) / 100;
  const totalWithdrawnRupees = Number(wallet.total_withdrawn || 0) / 100;

  const totalWageredRupees = Number(metrics.totalWageredPaise || 0) / 100;
  const totalWonRupees = Number(metrics.totalWonPaise || 0) / 100;
  const ggrRupees = Number(metrics.ggrPaise || 0) / 100;

  const tabs: Array<{ key: TabKey; label: string; icon: any; count?: number }> = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'wallet', label: 'Wallet & Buckets', icon: Coins },
    { key: 'transactions', label: 'Ledger', icon: History, count: recentTransactions.length },
    { key: 'deposits', label: 'Deposits', icon: ArrowDownLeft, count: deposits.length },
    { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight, count: withdrawals.length },
    { key: 'games', label: 'Game Bets', icon: Gamepad2, count: recentBets.length },
    { key: 'activity', label: 'Activity', icon: Clock },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'notes', label: 'Admin Notes', icon: FileText, count: notes.length },
    { key: 'audit', label: 'Audit Trail', icon: ShieldCheck, count: auditTrail.length },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-[12px] text-[#8c8c8c] hover:text-[#e1e1e1] transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Players
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-white/[0.05] border border-white/[0.08] text-base font-bold text-[#e1e1e1]">
              {(user.name || 'P').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">{user.name || 'Player'}</h1>
                {user.is_blocked ? (
                  <span className="rounded-[3px] bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[11px] font-medium text-rose-400">
                    BANNED
                  </span>
                ) : (
                  <span className="rounded-[3px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8c8c8c] mt-0.5">
                <span>ID: {user.id}</span>
                <button onClick={() => copyToClipboard(user.id)} className="hover:text-[#e1e1e1]" title="Copy ID">
                  {copiedId === user.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
                <span>•</span>
                <span>Phone: {user.phone || 'No phone'}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdjustModalOpen(true)}
              className="flex items-center gap-1.5 rounded-[4px] border border-[#2988ff]/40 bg-[#2988ff]/15 px-3 py-1.5 text-[12px] font-medium text-[#2988ff] hover:bg-[#2988ff]/25 transition-all shadow-sm"
            >
              <Coins className="h-3.5 w-3.5" />
              <span>Adjust Wallet</span>
            </button>

            <button
              onClick={handleToggleBan}
              className={`flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[12px] font-medium transition-all ${
                user.is_blocked
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              {user.is_blocked ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
              <span>{user.is_blocked ? 'Unban Player' : 'Ban Player'}</span>
            </button>
          </div>
        </div>

        {/* 10-Tab Navigation Bar */}
        <div className="flex items-center overflow-x-auto border-t border-white/[0.06] pt-2 scrollbar-none gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-[4px] px-3 py-1.5 text-[12px] font-medium transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-[#e1e1e1] shadow-sm'
                    : 'text-[#8c8c8c] hover:bg-white/[0.03] hover:text-[#e1e1e1]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#2988ff]' : 'text-[#666]'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="rounded-full bg-white/[0.06] px-1.5 py-0.2 text-[10px] font-mono text-[#a6a6a6]">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total Balance</span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{availableRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">All 3 buckets combined</p>
            </div>
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total Wagered</span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{totalWageredRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">{metrics.totalBets} total bets placed</p>
            </div>
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Total Won</span>
              <div className="mt-2 text-xl font-bold font-mono text-emerald-400">₹{totalWonRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">Pnl payout credits</p>
            </div>
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Gross Gaming Revenue</span>
              <div className={`mt-2 text-xl font-bold font-mono ${ggrRupees >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{ggrRupees.toFixed(2)}
              </div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">House margin generated</p>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5">
            <h3 className="text-[13px] font-semibold text-[#e1e1e1] mb-4">Player Identity & Coordinates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[12px]">
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Primary User ID</span>
                <span className="font-mono text-[#e1e1e1]">{user.id}</span>
              </div>
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Display Name</span>
                <span className="text-[#e1e1e1] font-medium">{user.name || '—'}</span>
              </div>
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Registered Mobile Number</span>
                <span className="font-mono text-[#e1e1e1]">{user.phone || '—'}</span>
              </div>
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Registration Date</span>
                <span className="text-[#e1e1e1]">{new Date(user.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Account Status</span>
                <span className={user.is_blocked ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {user.is_blocked ? `Suspended (${user.block_reason || 'Policy Violation'})` : 'Active / Good Standing'}
                </span>
              </div>
              <div>
                <span className="text-[#8c8c8c] block text-[11px]">Last Updated</span>
                <span className="text-[#e1e1e1]">{new Date(user.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: WALLET & BUCKETS */}
      {/* ============================================================ */}
      {activeTab === 'wallet' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Deposit Bucket</span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{depositRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">Priority 1 in bet debits</p>
            </div>
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Winnings Bucket</span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{winningsRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">Withdrawable funds</p>
            </div>
            <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4">
              <span className="text-[11px] font-mono text-[#8c8c8c] uppercase">Bonus / Rewards Bucket</span>
              <div className="mt-2 text-xl font-bold font-mono text-[#e1e1e1]">₹{bonusRupees.toFixed(2)}</div>
              <p className="mt-1 text-[11px] text-[#8c8c8c]">Non-withdrawable promotional credit</p>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5">
            <h3 className="text-[13px] font-semibold text-[#e1e1e1] mb-3">Lifetime Inflow & Outflow</h3>
            <div className="grid grid-cols-2 gap-4 text-[12px] font-mono">
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[11px]">Lifetime Deposited</span>
                <span className="text-emerald-400 text-lg font-bold">₹{totalDepositedRupees.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-[6px] bg-black/40 border border-white/[0.04]">
                <span className="text-[#8c8c8c] block text-[11px]">Lifetime Withdrawn</span>
                <span className="text-rose-400 text-lg font-bold">₹{totalWithdrawnRupees.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TRANSACTIONS (LEDGER) */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Bucket</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-4 py-2.5 text-right">Balance Before</th>
                <th className="px-4 py-2.5 text-right">Balance After</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11px]">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#8c8c8c] font-sans">
                    No ledger transactions recorded yet for this player.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => {
                  const amt = Number(tx.amount || 0) / 100;
                  const before = Number(tx.balance_before || 0) / 100;
                  const after = Number(tx.balance_after || 0) / 100;
                  const isCredit = ['DEPOSIT', 'WIN_PAYOUT', 'BET_REFUND', 'PROMO_BONUS', 'ADMIN_CREDIT'].includes(tx.transaction_type);

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-[#e1e1e1] truncate max-w-[80px]" title={tx.id}>{tx.id}</td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${
                          isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] uppercase">{tx.bucket}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amt).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#8c8c8c]">₹{before.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-[#e1e1e1]">₹{after.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DEPOSITS */}
      {/* ============================================================ */}
      {activeTab === 'deposits' && (
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Deposit ID</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">UTR Reference</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8c8c8c] font-sans">
                    No deposits recorded for this account.
                  </td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-[#e1e1e1]">{d.id}</td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold">₹{(Number(d.amount) / 100).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-[#8c8c8c]">{d.utr || '—'}</td>
                    <td className="px-4 py-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-medium ${
                        d.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        d.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#8c8c8c]">{new Date(d.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: WITHDRAWALS */}
      {/* ============================================================ */}
      {activeTab === 'withdrawals' && (
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Withdrawal ID</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Destination UPI</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#8c8c8c] font-sans">
                    No withdrawals recorded for this account.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-[#e1e1e1]">{w.id}</td>
                    <td className="px-4 py-2.5 text-rose-400 font-semibold">₹{(Number(w.amount) / 100).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-[#8c8c8c]">{w.upi_id || '—'}</td>
                    <td className="px-4 py-2.5 font-sans">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-medium ${
                        w.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        w.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#8c8c8c]">{new Date(w.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: GAME BETS */}
      {/* ============================================================ */}
      {activeTab === 'games' && (
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Bet ID</th>
                <th className="px-4 py-2.5">Round ID</th>
                <th className="px-4 py-2.5">Color Selected</th>
                <th className="px-4 py-2.5 text-right">Bet Amount</th>
                <th className="px-4 py-2.5 text-right">Payout</th>
                <th className="px-4 py-2.5">Outcome Status</th>
                <th className="px-4 py-2.5">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11.5px]">
              {recentBets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#8c8c8c] font-sans">
                    No game wagers recorded for this player yet.
                  </td>
                </tr>
              ) : (
                recentBets.map((b) => {
                  const betAmt = Number(b.bet_amount || 0) / 100;
                  const payoutAmt = Number(b.payout_amount || 0) / 100;
                  const isWon = b.status === 'WON';

                  return (
                    <tr key={b.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 text-[#e1e1e1] truncate max-w-[80px]" title={b.id}>{b.id}</td>
                      <td className="px-4 py-2.5 text-[#8c8c8c] truncate max-w-[100px]" title={b.round_id}>{b.round_id}</td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] uppercase font-bold ${
                          b.selected_option === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                          b.selected_option === 'red' ? 'bg-rose-500/20 text-rose-400' :
                          b.selected_option === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {b.selected_option}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#e1e1e1]">₹{betAmt.toFixed(2)}</td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${isWon ? 'text-emerald-400' : 'text-[#8c8c8c]'}`}>
                        ₹{payoutAmt.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-medium ${
                          isWon ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.04] text-[#8c8c8c]'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#8c8c8c]">{new Date(b.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: ACTIVITY */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Session & Account Telemetry</h3>
          <div className="space-y-3 text-[12px]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[#8c8c8c]">First Registered At</span>
              <span className="font-mono text-[#e1e1e1]">{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[#8c8c8c]">Last Profile Update</span>
              <span className="font-mono text-[#e1e1e1]">{new Date(user.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[#8c8c8c]">Total Bets Placed</span>
              <span className="font-mono text-[#e1e1e1]">{metrics.totalBets}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-[#8c8c8c]">Total Transactions</span>
              <span className="font-mono text-[#e1e1e1]">{recentTransactions.length} in recent history</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: SECURITY */}
      {/* ============================================================ */}
      {activeTab === 'security' && (
        <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[#e1e1e1]">Security Controls & State</h3>
          <div className="p-4 rounded-[6px] border border-white/[0.06] bg-black/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8c8c8c]">Suspension / Ban Status:</span>
              <span className={user.is_blocked ? 'text-rose-400 font-semibold text-[12px]' : 'text-emerald-400 font-semibold text-[12px]'}>
                {user.is_blocked ? 'RESTRICTED / BANNED' : 'CLEAR / AUTHORIZED'}
              </span>
            </div>
            {user.is_blocked && (
              <div className="text-[12px] text-[#a6a6a6] pt-1">
                <strong>Reason:</strong> {user.block_reason || 'Administrative restriction'}
              </div>
            )}
          </div>
          <div className="pt-2">
            <button
              onClick={handleToggleBan}
              className={`rounded-[4px] border px-4 py-2 text-[12px] font-medium transition-all ${
                user.is_blocked
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              {user.is_blocked ? 'Lift Suspension / Unban User' : 'Suspend / Ban Player Account'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 9: ADMIN NOTES */}
      {/* ============================================================ */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <form onSubmit={handleAddNote} className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 space-y-3">
            <label className="block text-[12px] font-medium text-[#e1e1e1]">Add Internal Staff Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record support resolution, VIP remarks, suspicious pattern findings..."
              className="w-full h-20 rounded-[4px] border border-white/[0.08] bg-black p-2.5 text-[12px] text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all"
              >
                {addingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                <span>Save Note</span>
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {notes.length === 0 ? (
              <div className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-8 text-center text-[#8c8c8c] text-[12px]">
                No admin notes added for this player yet.
              </div>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#8c8c8c]">
                    <span>Staff: <strong className="text-[#a6a6a6]">{n.author_id}</strong></span>
                    <span>{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-[12.5px] text-[#e1e1e1] whitespace-pre-wrap">{n.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 10: AUDIT HISTORY */}
      {/* ============================================================ */}
      {activeTab === 'audit' && (
        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-2.5">Audit ID</th>
                <th className="px-4 py-2.5">Action Executed</th>
                <th className="px-4 py-2.5">Details</th>
                <th className="px-4 py-2.5">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11px]">
              {auditTrail.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[#8c8c8c] font-sans">
                    No admin actions recorded on this account yet.
                  </td>
                </tr>
              ) : (
                auditTrail.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-[#e1e1e1]">{a.id}</td>
                    <td className="px-4 py-2.5 font-sans font-medium text-[#2988ff]">{a.action}</td>
                    <td className="px-4 py-2.5 text-[#8c8c8c] truncate max-w-[200px]" title={JSON.stringify(a.details)}>
                      {JSON.stringify(a.details)}
                    </td>
                    <td className="px-4 py-2.5 text-[#8c8c8c]">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* WALLET ADJUSTMENT MODAL */}
      {/* ============================================================ */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[8px] border border-white/[0.12] bg-[#212123] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-[#2988ff]" />
                <h3 className="text-sm font-semibold text-[#e1e1e1]">Authoritative Wallet Adjustment</h3>
              </div>
              <button onClick={() => setAdjustModalOpen(false)} className="text-[#8c8c8c] hover:text-[#e1e1e1]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {adjustError && (
              <div className="flex items-center gap-2 rounded-[4px] border border-red-500/20 bg-red-500/10 p-2.5 text-[11.5px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustWallet} className="space-y-4 text-[12px]">
              <div>
                <label className="block text-[#a6a6a6] mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('CREDIT')}
                    className={`rounded-[4px] border p-2 font-medium transition-all ${
                      adjustType === 'CREDIT'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                        : 'border-white/[0.08] bg-black text-[#8c8c8c]'
                    }`}
                  >
                    + CREDIT (Add Funds)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEBIT')}
                    className={`rounded-[4px] border p-2 font-medium transition-all ${
                      adjustType === 'DEBIT'
                        ? 'border-rose-500/40 bg-rose-500/15 text-rose-400'
                        : 'border-white/[0.08] bg-black text-[#8c8c8c]'
                    }`}
                  >
                    - DEBIT (Deduct Funds)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#a6a6a6] mb-1">Target Balance Bucket</label>
                <select
                  value={adjustBucket}
                  onChange={(e) => setAdjustBucket(e.target.value as any)}
                  className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                >
                  <option value="deposit">Deposit Bucket (Priority 1 in bets)</option>
                  <option value="winnings">Winnings Bucket (Withdrawable)</option>
                  <option value="bonus">Bonus Bucket (Promotional)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#a6a6a6] mb-1">Amount (in ₹ Rupees)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 font-mono text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#a6a6a6] mb-1">Mandatory Audit Reason</label>
                <textarea
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Support resolution for ticket #9821 / Compensation"
                  className="w-full h-16 rounded-[4px] border border-white/[0.08] bg-black p-2 text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="rounded-[4px] border border-white/[0.08] px-3 py-1.5 text-[#8c8c8c] hover:text-[#e1e1e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-4 py-1.5 font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50"
                >
                  {adjustSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Confirm Adjustment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
