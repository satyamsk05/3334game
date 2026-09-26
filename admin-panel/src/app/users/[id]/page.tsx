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
  Gamepad2,
  Lock,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  X,
  Pencil,
  Phone,
  MessageSquare
} from 'lucide-react';
import { adminService, UserDetailsResponse } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

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
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Edit profile state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banReason, setBanReason] = useState('Platform policy violation');
  const [banSubmitting, setBanSubmitting] = useState(false);

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
  // Action processing state
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUserDetails(userId);
      if (res.success && res.data) {
        setData(res.data);
        const u = res.data.user || (res.data as any).overview;
        if (u) {
          setEditName(u.name || '');
          setEditPhone(u.phone || '');
        }
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

  const copyPhoneToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(text);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Display name cannot be empty');
      return;
    }
    try {
      setEditSubmitting(true);
      setEditError(null);
      const res = await adminService.updateUser(userId, {
        name: editName.trim(),
        phone: editPhone.trim() || undefined
      });
      if (res.success) {
        setEditModalOpen(false);
        await fetchDetails();
      } else {
        setEditError(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleBan = () => {
    const targetUser = data?.user || (data as any)?.overview;
    if (!targetUser) return;
    setBanReason(targetUser.is_blocked ? '' : 'Platform policy violation');
    setBanModalOpen(true);
  };

  const handleConfirmBanToggle = async () => {
    const targetUser = data?.user || (data as any)?.overview;
    if (!targetUser) return;
    const isCurrentlyBlocked = Boolean(targetUser.is_blocked ?? targetUser.isBanned);

    try {
      setBanSubmitting(true);
      const res = await adminService.toggleBan(userId, !isCurrentlyBlocked, banReason);
      if (res.success) {
        setBanModalOpen(false);
        await fetchDetails();
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err: any) {
      alert(`Action error: ${err.response?.data?.message || err.message}`);
    } finally {
      setBanSubmitting(false);
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

  const handleApproveDeposit = async (depositId: string) => {
    try {
      setActionProcessingId(depositId);
      const res = await adminService.approveDeposit(depositId);
      if (res.success) {
        await fetchDetails();
      } else {
        alert(res.message || 'Approval failed');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Approval error');
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleRejectDeposit = async (depositId: string) => {
    if (!confirm('Are you sure you want to reject this deposit request?')) return;
    try {
      setActionProcessingId(depositId);
      const res = await adminService.rejectDeposit(depositId);
      if (res.success) {
        await fetchDetails();
      } else {
        alert(res.message || 'Rejection failed');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Rejection error');
    } finally {
      setActionProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono">
        <div className="text-center space-y-space-3">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-accent-primary" aria-label="Loading player dossier" />
          <p className="text-xs text-text-secondary">Loading authoritative user dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-space-4 font-mono text-sm">
        <Link href="/users" className="inline-flex items-center gap-space-1.5 text-xs text-text-secondary hover:text-text-primary transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to Player Directory
        </Link>
        <div role="alert" className="flex items-center gap-space-2 rounded-md border border-status-negative/30 bg-status-negative/10 p-space-4 text-xs text-status-negative">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error || 'Player record not found'}</span>
        </div>
      </div>
    );
  }

  const user = data.user || (data as any).overview || {
    id: userId,
    name: 'Player',
    phone: '',
    email: '',
    is_blocked: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const wallet = data.wallet || {};
  const metrics = data.metrics || {
    totalBets: (data as any).totalBets || (data as any).financialSummary?.approvedTransactionsCount || 0,
    totalWageredPaise: (data as any).totalWageredPaise || '0',
    totalWonPaise: (data as any).totalPayoutsPaise || '0',
    ggrPaise: '0'
  };
  const recentTransactions = data.recentTransactions || (data as any).transactions || [];
  const recentBets = data.recentBets || (data as any).bets || (data as any).gameHistory || [];
  const deposits = data.deposits || [];
  const withdrawals = data.withdrawals || [];
  const notes = data.notes || (data as any).adminNotes || [];
  const auditTrail = data.auditTrail || (data as any).audits || (data as any).auditHistory || [];

  const depositRupees = Number(wallet.deposit_balance ?? (wallet as any).depositPaise ?? 0) / 100;
  const winningsRupees = Number(wallet.winnings_balance ?? (wallet as any).winningPaise ?? 0) / 100;
  const bonusRupees = Number(wallet.rewards_balance ?? (wallet as any).bonusPaise ?? 0) / 100;
  const availableRupees = Number(wallet.available_balance ?? (wallet as any).totalPaise ?? 0) / 100;
  const totalDepositedRupees = Number(wallet.total_deposited ?? (data as any).financialSummary?.totalDepositsPaise ?? 0) / 100;
  const totalWithdrawnRupees = Number(wallet.total_withdrawn ?? (data as any).financialSummary?.totalWithdrawalsPaise ?? 0) / 100;

  const totalWageredRupees = Number(metrics.totalWageredPaise ?? 0) / 100;
  const totalWonRupees = Number(metrics.totalWonPaise ?? 0) / 100;
  const ggrRupees = Number(metrics.ggrPaise ?? 0) / 100;

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
    <div className="space-y-6 font-sans text-sm">
      
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200/80 pb-5">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-fast w-fit">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to Players
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-lg shadow-md">
              {(user.name || 'P').slice(0, 2).toUpperCase()}
              <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-white ${user.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">{user.name || 'Player'}</h1>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 ease-out active:scale-[0.96]"
                  title="Edit Player Profile"
                  aria-label="Edit Player Profile"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {user.is_blocked ? (
                  <Badge variant="negative" ariaLabel="Account suspended">BANNED</Badge>
                ) : (
                  <Badge variant="positive" ariaLabel="Account active">ACTIVE</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1 font-medium">
                <div className="flex items-center gap-1">
                  <span>ID: <span className="font-mono text-gray-700">{user.id}</span></span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(user.id)} 
                    className="hover:text-gray-700 p-0.5 rounded transition-fast" 
                    aria-label={`Copy user ID ${user.id}`}
                    title="Copy ID"
                  >
                    {copiedId === user.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>

                <span aria-hidden="true">•</span>

                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>
                    Phone: <span className="font-mono text-gray-700">
                      {user.phone ? (user.phone.startsWith('91') && user.phone.length === 12 ? `+91 ${user.phone.slice(2)}` : user.phone) : 'No phone'}
                    </span>
                  </span>
                  {user.phone && (
                    <>
                      <button 
                        type="button"
                        onClick={() => copyPhoneToClipboard(user.phone)} 
                        className="hover:text-gray-700 p-0.5 rounded transition-fast" 
                        aria-label={`Copy phone ${user.phone}`}
                        title="Copy Phone"
                      >
                        {copiedPhone === user.phone ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                      <a
                        href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-all duration-150 active:scale-[0.96]"
                        title="Open WhatsApp Chat"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setEditModalOpen(true)}
              icon={<Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Edit Profile
            </Button>

            <Button
              variant="dark"
              size="md"
              onClick={() => setAdjustModalOpen(true)}
              icon={<Coins className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              Adjust Wallet
            </Button>

            <Button
              variant={user.is_blocked ? 'secondary' : 'danger'}
              size="md"
              onClick={handleToggleBan}
              icon={user.is_blocked ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />}
            >
              {user.is_blocked ? 'Unban Player' : 'Ban Player'}
            </Button>
          </div>
        </div>

        {/* 10-Tab Navigation Bar */}
        <div 
          role="tablist"
          aria-label="User details sections"
          className="flex items-center overflow-x-auto border-t border-gray-200/60 pt-3 scrollbar-none gap-1.5"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-fast ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80 font-bold'
                    : 'text-gray-500 hover:bg-white/60 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 font-bold">
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
          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="default">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Balance</span>
              <div className="mt-2 text-2xl font-bold font-mono text-gray-900">₹{availableRupees.toFixed(2)}</div>
              <p className="mt-1 text-xs text-gray-400">All 3 buckets combined</p>
            </Card>
            <Card variant="default">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Wagered</span>
              <div className="mt-2 text-2xl font-bold font-mono text-gray-900">₹{totalWageredRupees.toFixed(2)}</div>
              <p className="mt-1 text-xs text-gray-400">{metrics.totalBets} total bets placed</p>
            </Card>
            <Card variant="default">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Won</span>
              <div className="mt-2 text-2xl font-bold font-mono text-emerald-600">₹{totalWonRupees.toFixed(2)}</div>
              <p className="mt-1 text-xs text-gray-400">Payout credits</p>
            </Card>
            <Card variant="default">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Gaming Revenue</span>
              <div className={`mt-2 text-2xl font-bold font-mono ${ggrRupees >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₹{ggrRupees.toFixed(2)}
              </div>
              <p className="mt-1 text-xs text-gray-400">House margin generated</p>
            </Card>
          </div>

          {/* Player Identity Card */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Player Identity & Coordinates</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                icon={<Pencil className="h-3 w-3" />}
              >
                Edit Info
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Primary User ID</span>
                <span className="font-mono text-gray-900 font-bold text-sm">{user.id}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Display Name</span>
                <span className="text-gray-900 font-bold text-sm">{user.name || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Registered Mobile</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-gray-900 font-bold text-sm">
                    {user.phone ? (user.phone.startsWith('91') && user.phone.length === 12 ? `+91 ${user.phone.slice(2)}` : user.phone) : '—'}
                  </span>
                  {user.phone && (
                    <a
                      href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Registration Date</span>
                <span className="text-gray-800 font-medium">{new Date(user.created_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Account Status</span>
                <span className={user.is_blocked ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {user.is_blocked ? `Suspended (${user.block_reason || 'Policy Violation'})` : 'Active / Good Standing'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs font-semibold">Last Activity</span>
                <span className="text-gray-800 font-medium">{new Date(user.updated_at).toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: WALLET & BUCKETS */}
      {/* ============================================================ */}
      {activeTab === 'wallet' && (
        <div className="space-y-space-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-4">
            <Card variant="default">
              <span className="text-xs text-text-secondary uppercase">Deposit Bucket</span>
              <div className="mt-space-2 text-xl font-bold font-mono text-text-primary">₹{depositRupees.toFixed(2)}</div>
              <p className="mt-space-1 text-xs text-text-tertiary">Priority 1 in bet debits</p>
            </Card>
            <Card variant="default">
              <span className="text-xs text-text-secondary uppercase">Winnings Bucket</span>
              <div className="mt-space-2 text-xl font-bold font-mono text-status-positive">₹{winningsRupees.toFixed(2)}</div>
              <p className="mt-space-1 text-xs text-text-tertiary">Withdrawable funds</p>
            </Card>
            <Card variant="default">
              <span className="text-xs text-text-secondary uppercase">Bonus / Rewards Bucket</span>
              <div className="mt-space-2 text-xl font-bold font-mono text-text-primary">₹{bonusRupees.toFixed(2)}</div>
              <p className="mt-space-1 text-xs text-text-tertiary">Non-withdrawable promotional credit</p>
            </Card>
          </div>

          <Card variant="default">
            <h3 className="text-sm font-semibold text-text-primary mb-space-3">Lifetime Inflow & Outflow</h3>
            <div className="grid grid-cols-2 gap-space-4 text-xs font-mono">
              <div className="p-space-3 rounded-xs bg-surface-muted border border-border-muted">
                <span className="text-text-secondary block text-xs">Lifetime Deposited</span>
                <span className="text-status-positive text-lg font-bold">₹{totalDepositedRupees.toFixed(2)}</span>
              </div>
              <div className="p-space-3 rounded-xs bg-surface-muted border border-border-muted">
                <span className="text-text-secondary block text-xs">Lifetime Withdrawn</span>
                <span className="text-status-negative text-lg font-bold">₹{totalWithdrawnRupees.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TRANSACTIONS (LEDGER) */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-2.5">ID</th>
                <th className="px-space-4 py-space-2.5">Type</th>
                <th className="px-space-4 py-space-2.5">Bucket</th>
                <th className="px-space-4 py-space-2.5 text-right">Amount</th>
                <th className="px-space-4 py-space-2.5 text-right">Balance Before</th>
                <th className="px-space-4 py-space-2.5 text-right">Balance After</th>
                <th className="px-space-4 py-space-2.5">Description</th>
                <th className="px-space-4 py-space-2.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
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
                    <tr key={tx.id} className="hover:bg-surface-muted/60 transition-fast">
                      <td className="px-space-4 py-space-2.5 text-text-primary truncate max-w-[80px]" title={tx.id}>{tx.id}</td>
                      <td className="px-space-4 py-space-2.5 font-sans">
                        <Badge variant={isCredit ? 'positive' : 'neutral'}>
                          {tx.transaction_type}
                        </Badge>
                      </td>
                      <td className="px-space-4 py-space-2.5 text-text-secondary uppercase text-xs">{tx.bucket}</td>
                      <td className={`px-space-4 py-space-2.5 text-right font-semibold ${isCredit ? 'text-status-positive' : 'text-text-primary'}`}>
                        {isCredit ? '+' : '-'}₹{Math.abs(amt).toFixed(2)}
                      </td>
                      <td className="px-space-4 py-space-2.5 text-right text-text-secondary">₹{before.toFixed(2)}</td>
                      <td className="px-space-4 py-space-2.5 text-right text-text-primary">₹{after.toFixed(2)}</td>
                      <td className="px-space-4 py-space-2.5 text-text-secondary truncate max-w-[150px]" title={tx.description || tx.reference_id}>
                        {tx.description || tx.reference_id || '—'}
                      </td>
                      <td className="px-space-4 py-space-2.5 text-text-tertiary whitespace-nowrap">
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
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-2.5">Deposit ID</th>
                <th className="px-space-4 py-space-2.5">Amount</th>
                <th className="px-space-4 py-space-2.5">UTR Reference</th>
                <th className="px-space-4 py-space-2.5">Status</th>
                <th className="px-space-4 py-space-2.5">Date</th>
                <th className="px-space-4 py-space-2.5 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
                    No deposits recorded for this account.
                  </td>
                </tr>
              ) : (
                deposits.map((d) => {
                  const isProcessing = actionProcessingId === d.id;
                  const isPending = d.status === 'PENDING';

                  return (
                    <tr key={d.id} className="hover:bg-surface-muted/60 transition-fast">
                      <td className="px-space-4 py-space-2.5 text-text-primary font-bold">{d.id}</td>
                      <td className="px-space-4 py-space-2.5 text-status-positive font-semibold text-sm">₹{(Number(d.amount) / 100).toFixed(2)}</td>
                      <td className="px-space-4 py-space-2.5 text-text-secondary select-all">{d.utr || '—'}</td>
                      <td className="px-space-4 py-space-2.5 font-sans">
                        <Badge variant={d.status === 'APPROVED' ? 'positive' : d.status === 'PENDING' ? 'warning' : 'negative'}>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="px-space-4 py-space-2.5 text-text-tertiary">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="px-space-4 py-space-2.5 text-center">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApproveDeposit(d.id)}
                              className="px-2.5 py-1 rounded bg-status-positive text-white font-sans font-bold hover:bg-status-positive/90 transition-fast text-[11px] disabled:opacity-50"
                            >
                              {isProcessing ? '...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleRejectDeposit(d.id)}
                              className="px-2.5 py-1 rounded bg-status-negative/20 text-status-negative font-sans font-medium hover:bg-status-negative/30 transition-fast text-[11px] disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-tertiary font-sans">—</span>
                        )}
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
      {/* TAB 5: WITHDRAWALS */}
      {/* ============================================================ */}
      {activeTab === 'withdrawals' && (
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-2.5">Withdrawal ID</th>
                <th className="px-space-4 py-space-2.5">Amount</th>
                <th className="px-space-4 py-space-2.5">Destination UPI</th>
                <th className="px-space-4 py-space-2.5">Status</th>
                <th className="px-space-4 py-space-2.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
                    No withdrawals recorded for this account.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-surface-muted/60 transition-fast">
                    <td className="px-space-4 py-space-2.5 text-text-primary">{w.id}</td>
                    <td className="px-space-4 py-space-2.5 text-text-primary font-semibold">₹{(Number(w.amount) / 100).toFixed(2)}</td>
                    <td className="px-space-4 py-space-2.5 text-text-secondary">{w.upi_id || '—'}</td>
                    <td className="px-space-4 py-space-2.5 font-sans">
                      <Badge variant={w.status === 'APPROVED' ? 'positive' : w.status === 'PENDING' ? 'warning' : 'negative'}>
                        {w.status}
                      </Badge>
                    </td>
                    <td className="px-space-4 py-space-2.5 text-text-tertiary">{new Date(w.created_at).toLocaleString()}</td>
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
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-2.5">Bet ID</th>
                <th className="px-space-4 py-space-2.5">Round ID</th>
                <th className="px-space-4 py-space-2.5">Color Selected</th>
                <th className="px-space-4 py-space-2.5 text-right">Bet Amount</th>
                <th className="px-space-4 py-space-2.5 text-right">Payout</th>
                <th className="px-space-4 py-space-2.5">Outcome</th>
                <th className="px-space-4 py-space-2.5">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {recentBets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
                    No game wagers recorded for this player yet.
                  </td>
                </tr>
              ) : (
                recentBets.map((b) => {
                  const betAmt = Number(b.bet_amount || 0) / 100;
                  const payoutAmt = Number(b.payout_amount || 0) / 100;
                  const isWon = b.status === 'WON';

                  return (
                    <tr key={b.id} className="hover:bg-surface-muted/60 transition-fast">
                      <td className="px-space-4 py-space-2.5 text-text-primary truncate max-w-[80px]" title={b.id}>{b.id}</td>
                      <td className="px-space-4 py-space-2.5 text-text-secondary truncate max-w-[100px]" title={b.round_id}>{b.round_id}</td>
                      <td className="px-space-4 py-space-2.5 font-sans">
                        <span className={`px-space-2 py-0.5 rounded-xs text-[10px] uppercase font-bold ${
                          b.selected_option === 'green' ? 'bg-status-positive/20 text-status-positive' :
                          b.selected_option === 'red' ? 'bg-status-negative/20 text-status-negative' :
                          b.selected_option === 'purple' ? 'bg-purple-500/20 text-purple-400' : 'bg-surface-muted text-text-secondary'
                        }`}>
                          {b.selected_option}
                        </span>
                      </td>
                      <td className="px-space-4 py-space-2.5 text-right text-text-primary">₹{betAmt.toFixed(2)}</td>
                      <td className={`px-space-4 py-space-2.5 text-right font-semibold ${isWon ? 'text-status-positive' : 'text-text-secondary'}`}>
                        ₹{payoutAmt.toFixed(2)}
                      </td>
                      <td className="px-space-4 py-space-2.5 font-sans">
                        <Badge variant={isWon ? 'positive' : 'neutral'}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="px-space-4 py-space-2.5 text-text-tertiary">{new Date(b.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: ACTIVITY & DEVICE TELEMETRY */}
      {/* ============================================================ */}
      {activeTab === 'activity' && (
        <div className="space-y-space-4">
          {/* Primary Hardware Spec Card */}
          <Card variant="default" className="space-y-space-4">
            <div className="flex items-center justify-between border-b border-border-default pb-space-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Device & Hardware Telemetry</h3>
              </div>
              <Badge variant="mint">Live Telemetry</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">Phone Model</span>
                <span className="text-text-primary font-bold text-sm block truncate">{user.device_model || 'CPH2613 (OnePlus / Android)'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">Operating System</span>
                <span className="text-text-primary font-bold text-sm block">{user.os_version || 'Android 16'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">App Version</span>
                <span className="text-text-primary font-bold text-sm block">{user.app_version || 'v1.0.4'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">Last IP Address</span>
                <span className="text-accent-primary font-bold text-sm block">{user.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">Detected Location / Network</span>
                <span className="text-text-primary font-bold text-sm block truncate">{user.location || 'India (Cellular / WiFi)'}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-muted border border-border-muted space-y-1">
                <span className="text-text-secondary block text-[11px] font-sans">Last Sign In</span>
                <span className="text-text-primary font-bold text-sm block truncate">{new Date((user as any).lastActive || user.updated_at || user.created_at).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Session History Table */}
          <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
            <div className="p-3 bg-surface-muted border-b border-border-default text-xs font-semibold text-text-primary flex items-center justify-between">
              <span>Recent Login Sessions & Connection Logs</span>
              <span className="text-[11px] text-text-secondary font-mono">{(data.sessions || []).length} sessions</span>
            </div>
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-secondary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-2">Session ID</th>
                  <th className="px-4 py-2">Device</th>
                  <th className="px-4 py-2">OS Version</th>
                  <th className="px-4 py-2">IP Address</th>
                  <th className="px-4 py-2">Network</th>
                  <th className="px-4 py-2">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted font-mono text-xs">
                {(!data.sessions || data.sessions.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-text-secondary font-sans">
                      Active device telemetry mapped to current session ({user.device_model || 'Android'}).
                    </td>
                  </tr>
                ) : (
                  data.sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-surface-muted/60 transition-fast">
                      <td className="px-4 py-2 text-text-primary truncate max-w-[90px]">{sess.id}</td>
                      <td className="px-4 py-2 text-text-primary font-sans">{sess.device_model}</td>
                      <td className="px-4 py-2 text-text-secondary">{sess.os_version}</td>
                      <td className="px-4 py-2 text-accent-primary">{sess.ip_address}</td>
                      <td className="px-4 py-2 text-text-secondary">{sess.network_type || 'Mobile'}</td>
                      <td className="px-4 py-2 text-text-tertiary">{new Date(sess.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: SECURITY */}
      {/* ============================================================ */}
      {activeTab === 'security' && (
        <Card variant="default" className="space-y-space-4">
          <h3 className="text-sm font-semibold text-text-primary">Security Controls & State</h3>
          <div className="p-space-4 rounded-xs border border-border-muted bg-surface-muted space-y-space-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Suspension / Ban Status:</span>
              <span className={user.is_blocked ? 'text-status-negative font-semibold text-xs' : 'text-status-positive font-semibold text-xs'}>
                {user.is_blocked ? 'RESTRICTED / BANNED' : 'CLEAR / AUTHORIZED'}
              </span>
            </div>
            {user.is_blocked && (
              <div className="text-xs text-text-secondary pt-1">
                <strong>Reason:</strong> {user.block_reason || 'Administrative restriction'}
              </div>
            )}
          </div>
          <div className="pt-space-2">
            <Button
              variant={user.is_blocked ? 'secondary' : 'danger'}
              onClick={handleToggleBan}
            >
              {user.is_blocked ? 'Lift Suspension / Unban User' : 'Suspend / Ban Player Account'}
            </Button>
          </div>
        </Card>
      )}

      {/* ============================================================ */}
      {/* TAB 9: ADMIN NOTES */}
      {/* ============================================================ */}
      {activeTab === 'notes' && (
        <div className="space-y-space-4">
          <form onSubmit={handleAddNote} className="rounded-lg border border-border-default bg-surface-raised p-space-4 space-y-space-3">
            <label className="block text-xs font-medium text-text-primary">Add Internal Staff Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record support resolution, VIP remarks, suspicious pattern findings..."
              className="w-full h-20 rounded-xs border border-border-default bg-surface-base p-space-2.5 text-xs text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={addingNote}
                disabled={!newNote.trim()}
                icon={<Send className="h-3 w-3" aria-hidden="true" />}
              >
                Save Note
              </Button>
            </div>
          </form>

          <div className="space-y-space-2">
            {notes.length === 0 ? (
              <div className="rounded-lg border border-border-default bg-surface-raised p-space-8 text-center text-text-secondary text-xs">
                No admin notes added for this player yet.
              </div>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="rounded-lg border border-border-default bg-surface-raised p-space-4 space-y-space-1">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>Staff: <strong className="text-text-primary">{n.author_id}</strong></span>
                    <span className="text-text-tertiary">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-text-primary whitespace-pre-wrap">{n.note}</p>
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
        <div className="overflow-hidden rounded-lg border border-border-default bg-surface-raised">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-muted text-text-secondary uppercase text-xs font-mono tracking-wider">
              <tr>
                <th className="px-space-4 py-space-2.5">Audit ID</th>
                <th className="px-space-4 py-space-2.5">Action Executed</th>
                <th className="px-space-4 py-space-2.5">Details</th>
                <th className="px-space-4 py-space-2.5">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted font-mono text-xs">
              {auditTrail.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-space-4 py-space-8 text-center text-text-secondary font-sans">
                    No admin actions recorded on this account yet.
                  </td>
                </tr>
              ) : (
                auditTrail.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-muted/60 transition-fast">
                    <td className="px-space-4 py-space-2.5 text-text-primary">{a.id}</td>
                    <td className="px-space-4 py-space-2.5 font-sans font-medium text-accent-primary">{a.action}</td>
                    <td className="px-space-4 py-space-2.5 text-text-secondary truncate max-w-[200px]" title={JSON.stringify(a.details)}>
                      {JSON.stringify(a.details)}
                    </td>
                    <td className="px-space-4 py-space-2.5 text-text-tertiary">{new Date(a.created_at).toLocaleString()}</td>
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
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Authoritative Wallet Adjustment"
        description="Debit or Credit integer paise to user balance buckets with an audit log."
        maxWidth="md"
      >
        <div className="space-y-space-4 font-mono text-xs pt-space-2">
          {adjustError && (
            <div role="alert" className="flex items-center gap-space-2 rounded-xs border border-status-negative/30 bg-status-negative/10 p-space-2.5 text-xs text-status-negative">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{adjustError}</span>
            </div>
          )}

          <form onSubmit={handleAdjustWallet} className="space-y-space-4 text-xs">
            <div>
              <label className="block text-text-secondary mb-1">Adjustment Type</label>
              <div className="grid grid-cols-2 gap-space-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`rounded-xs border p-space-2 font-medium transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                    adjustType === 'CREDIT'
                      ? 'border-status-positive/40 bg-status-positive/15 text-status-positive'
                      : 'border-border-default bg-surface-base text-text-secondary'
                  }`}
                >
                  + CREDIT (Add Funds)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`rounded-xs border p-space-2 font-medium transition-fast focus-visible:ring-2 focus-visible:ring-accent-primary ${
                    adjustType === 'DEBIT'
                      ? 'border-status-negative/40 bg-status-negative/15 text-status-negative'
                      : 'border-border-default bg-surface-base text-text-secondary'
                  }`}
                >
                  - DEBIT (Deduct Funds)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-text-secondary mb-1">Target Balance Bucket</label>
              <select
                value={adjustBucket}
                onChange={(e) => setAdjustBucket(e.target.value as any)}
                className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              >
                <option value="deposit">Deposit Bucket (Priority 1 in bets)</option>
                <option value="winnings">Winnings Bucket (Withdrawable)</option>
                <option value="bonus">Bonus Bucket (Promotional)</option>
              </select>
            </div>

            <div>
              <label className="block text-text-secondary mb-1">Amount (in ₹ Rupees)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="e.g. 500.00"
                className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 font-mono text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              />
            </div>

            <div>
              <label className="block text-text-secondary mb-1">Mandatory Audit Reason</label>
              <textarea
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Support resolution for ticket #9821 / Compensation"
                className="w-full h-16 rounded-xs border border-border-default bg-surface-base p-space-2 text-text-primary placeholder-text-tertiary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              />
            </div>

            <div className="flex items-center justify-end gap-space-2 pt-space-2 border-t border-border-muted">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={adjustSubmitting}
              >
                Confirm Adjustment
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* EDIT PROFILE MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Player Profile"
        description="Update authoritative player identity and linked WhatsApp mobile number."
        maxWidth="md"
      >
        <div className="space-y-space-4 font-mono text-xs pt-space-2">
          {editError && (
            <div role="alert" className="flex items-center gap-space-2 rounded-xs border border-status-negative/30 bg-status-negative/10 p-space-2.5 text-xs text-status-negative">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{editError}</span>
            </div>
          )}

          <form onSubmit={handleEditProfileSubmit} className="space-y-space-4 text-xs">
            <div>
              <label className="block text-text-secondary mb-1">User / Account ID</label>
              <input
                type="text"
                value={userId}
                disabled
                className="w-full h-8 rounded-xs border border-border-default bg-surface-muted px-space-2.5 font-mono text-text-tertiary cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-text-secondary mb-1">Display Name / Username</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter player display name"
                className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              />
            </div>

            <div>
              <label className="block text-text-secondary mb-1">WhatsApp / Phone Number</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. 9876543210 or +919876543210"
                className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 font-mono text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              />
            </div>

            <div className="flex items-center justify-end gap-space-2 pt-space-2 border-t border-border-muted">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={editSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* BAN / SUSPEND MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        title={user.is_blocked ? "Unban Player Account" : "Suspend Player Account"}
        description={user.is_blocked ? "Restore betting and wallet capabilities for this user." : "Block this account from placing bets, depositing, or withdrawing."}
        maxWidth="sm"
      >
        <div className="space-y-space-4 font-mono text-xs pt-space-2">
          {!user.is_blocked && (
            <div>
              <label className="block text-text-secondary mb-1">Suspension Reason</label>
              <input
                type="text"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Reason for suspension"
                className="w-full h-8 rounded-xs border border-border-default bg-surface-base px-space-2.5 text-text-primary focus:border-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary transition-fast"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-space-2 pt-space-2 border-t border-border-muted">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setBanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={user.is_blocked ? "primary" : "danger"}
              size="sm"
              loading={banSubmitting}
              onClick={handleConfirmBanToggle}
            >
              {user.is_blocked ? "Confirm Unban" : "Confirm Suspension"}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
