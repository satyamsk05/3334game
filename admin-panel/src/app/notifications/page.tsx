'use client';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Smartphone,
  Users,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Volume2,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface NotificationLog {
  id: string;
  title: string;
  body: string;
  targetAudience: string;
  userId?: string;
  sentAt: string;
  status: 'SENT' | 'DELIVERED';
  deviceCount?: number;
}

const TEMPLATES = [
  {
    name: '🎁 ₹50 Bonus Drop',
    title: '🎁 Surprise ₹50 Bonus Added!',
    body: 'We just credited ₹50 bonus into your wallet! Play XO 1v1 Battle or Ring of Future now to win real cash.'
  },
  {
    name: '⚔️ XO 1v1 Tournament',
    title: '⚔️ Live XO Battles Are Live!',
    body: 'Challenge real players in XO 1v1 Battle starting at just ₹1. Double your cash in 60 seconds!'
  },
  {
    name: '🎡 30x Ring Jackpot',
    title: '🎡 Ring of Future: 30x Green Multiplier!',
    body: 'Green 30x multiplier round is active. Place your color chips and grab huge payouts!'
  },
  {
    name: '💰 Deposit 100% Match',
    title: '💰 Double Your Deposit (100% Match)',
    body: 'Deposit ₹100 or more today and receive 100% instant bonus match in your gaming wallet.'
  },
  {
    name: '⚡ Fast Withdrawal Alert',
    title: '⚡ Instant 24/7 UPI Withdrawals',
    body: 'Your winnings can now be withdrawn instantly to any UPI ID in under 60 seconds.'
  },
  {
    name: '🛠️ Scheduled Maintenance',
    title: '🛠️ Brief Server Maintenance Tonight',
    body: 'We will undergo a brief 10-minute server upgrade at 02:00 AM IST to make matchmaking even faster.'
  }
];

export default function PushNotificationsPage() {
  // Mode: ALL or SINGLE
  const [targetMode, setTargetMode] = useState<'ALL' | 'SINGLE'>('ALL');
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserPhone, setTargetUserPhone] = useState('');

  // Notification Fields
  const [title, setTitle] = useState('🎁 Surprise ₹50 Bonus Added!');
  const [body, setBody] = useState('We just credited ₹50 bonus into your wallet! Play XO 1v1 Battle or Ring of Future now to win real cash.');

  // Status & Logs
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  // Load past logs from localStorage or memory
  useEffect(() => {
    try {
      const saved = localStorage.getItem('push_notification_logs');
      if (saved) {
        setLogs(JSON.parse(saved));
      } else {
        // Initial sample logs
        setLogs([
          {
            id: 'notif_init_1',
            title: '🎁 Welcome Bonus Credited',
            body: 'Welcome to Play In Game! Enjoy your free welcome balance.',
            targetAudience: 'ALL',
            sentAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'DELIVERED',
            deviceCount: 142
          }
        ]);
      }
    } catch (_e) {}
  }, []);

  const handleApplyTemplate = (tmpl: { title: string; body: string }) => {
    setTitle(tmpl.title);
    setBody(tmpl.body);
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || !body.trim()) {
      setErrorMsg('Please enter both Title and Message Body');
      return;
    }

    if (targetMode === 'SINGLE' && !targetUserId.trim() && !targetUserPhone.trim()) {
      setErrorMsg('Please enter the target User ID or Phone Number for single user alert');
      return;
    }

    try {
      setSending(true);
      const res = await adminService.sendPushNotification({
        title: title.trim(),
        body: body.trim(),
        targetAudience: targetMode,
        userId: targetMode === 'SINGLE' ? (targetUserId.trim() || targetUserPhone.trim()) : undefined
      });

      if (res.success) {
        const newLog: NotificationLog = {
          id: `notif_${Date.now()}`,
          title: title.trim(),
          body: body.trim(),
          targetAudience: targetMode,
          userId: targetMode === 'SINGLE' ? (targetUserId.trim() || targetUserPhone.trim()) : undefined,
          sentAt: new Date().toISOString(),
          status: 'DELIVERED',
          deviceCount: res.data?.sentCount || (targetMode === 'ALL' ? 1 : 1)
        };

        const updatedLogs = [newLog, ...logs].slice(0, 30);
        setLogs(updatedLogs);
        try {
          localStorage.setItem('push_notification_logs', JSON.stringify(updatedLogs));
        } catch (_e) {}

        setSuccessMsg(res.message || 'Push notification dispatched to user mobile devices successfully!');
      } else {
        setErrorMsg(res.message || 'Failed to dispatch push notification');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error sending push notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Push Notifications Hub</h1>
            <Badge variant="positive">Firebase Cloud Messaging (FCM)</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Send instant real-time push alerts directly to players' mobile lock screens and notification trays
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-status-positive/20 bg-status-positive/10 p-3.5 text-xs text-status-positive font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-status-negative/20 bg-status-negative/10 p-3.5 text-xs text-status-negative font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Composer & Mobile Mockup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Notification Composer (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="p-5 space-y-5 border-border-default bg-surface-raised shadow-sm">
            
            {/* Target Audience Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-2 uppercase tracking-wider text-[11px]">
                Target Audience
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-base border border-border-default">
                <button
                  type="button"
                  onClick={() => setTargetMode('ALL')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-fast ${
                    targetMode === 'ALL'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>All Registered Players (Broadcast)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetMode('SINGLE')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-fast ${
                    targetMode === 'SINGLE'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Targeted Single Player</span>
                </button>
              </div>
            </div>

            {/* Targeted User Input (If SINGLE) */}
            {targetMode === 'SINGLE' && (
              <div className="p-3.5 rounded-xl bg-surface-base border border-accent-primary/30 space-y-2 animate-in fade-in duration-200">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-accent-primary" />
                  <span>Specify Recipient User</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">User ID</label>
                    <input
                      type="text"
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      placeholder="e.g. usr_179048382..."
                      className="w-full h-8 rounded-lg border border-border-default bg-surface-raised px-2.5 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-text-secondary mb-1">Or Phone Number</label>
                    <input
                      type="text"
                      value={targetUserPhone}
                      onChange={(e) => setTargetUserPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-8 rounded-lg border border-border-default bg-surface-raised px-2.5 font-mono text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider text-[11px]">
                  One-Click Templates
                </span>
                <span className="text-[10px] text-text-tertiary">Click to auto-fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border-default bg-surface-base text-[11px] text-text-secondary hover:text-text-primary hover:border-accent-primary/40 hover:bg-surface-subtle transition-fast"
                  >
                    <span>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Message Form */}
            <form onSubmit={handleSendPush} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 🎁 Weekend Bonus Alert!"
                  className="w-full h-9 rounded-xl border border-border-default bg-surface-base px-3 text-xs font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Message Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter the full message that will display on lock screen..."
                  rows={3}
                  className="w-full rounded-xl border border-border-default bg-surface-base p-3 text-xs text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
                <span className="text-[11px] text-text-tertiary mt-1 block">
                  Keep it punchy (1-2 sentences) for best CTR on mobile lock screens.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-text-tertiary flex items-center gap-1">
                  <Volume2 className="h-3 w-3 text-status-positive" />
                  <span>High priority with sound & heads-up banner</span>
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={sending || !title.trim() || !body.trim()}
                  isLoading={sending}
                  className="rounded-xl px-5"
                >
                  <Send className="h-4 w-4 mr-1.5" />
                  <span>{targetMode === 'ALL' ? 'Broadcast to All Devices' : 'Send Targeted Alert'}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Interactive Android Mockup (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-1">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-[11px] block mb-2">
              📱 Live Android Phone Preview
            </span>

            {/* Phone Bezel */}
            <div className="relative mx-auto w-full max-w-[320px] rounded-[36px] bg-gray-950 p-3 shadow-2xl border-[3px] border-gray-800">
              
              {/* Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-20 rounded-full bg-black flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-900 border border-gray-800" />
              </div>

              {/* Phone Screen Area */}
              <div className="relative h-[480px] w-full rounded-[26px] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-4 overflow-hidden flex flex-col justify-between text-white font-sans">
                
                {/* Status Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-1 px-1">
                  <span>15:45</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <div className="h-2 w-4 rounded-sm border border-gray-400 bg-gray-400/80" />
                  </div>
                </div>

                {/* Lock Screen Clock */}
                <div className="text-center mt-6 space-y-1">
                  <div className="text-4xl font-extrabold tracking-tight text-white/90 font-mono">15:45</div>
                  <div className="text-[11px] text-indigo-200/70 font-medium">Sunday, 27 September</div>
                </div>

                {/* Floating Push Notification Banner */}
                <div className="mt-4 mb-auto p-3.5 rounded-2xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-xl space-y-2 animate-in slide-in-from-top-3 duration-300">
                  
                  {/* App Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[10px] font-bold text-black shadow-sm">
                        BIT
                      </div>
                      <span className="text-xs font-semibold text-white/90 tracking-wide">Bit Arcade Game</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                  </div>

                  {/* Notification Content */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-300 leading-snug">
                      {title.trim() || 'Notification Title'}
                    </h4>
                    <p className="text-[11px] text-gray-200/90 leading-relaxed break-words">
                      {body.trim() || 'Notification message description will appear here on player device...'}
                    </p>
                  </div>

                  {/* Sound & Action indicator */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Volume2 className="h-2.5 w-2.5 text-emerald-400" /> Sound Alert
                    </span>
                    <span className="text-amber-400/80 font-medium">Tap to open app →</span>
                  </div>
                </div>

                {/* Lock Screen Bottom Bar */}
                <div className="flex items-center justify-between px-3 text-[10px] text-gray-400 pb-1">
                  <span>Swipe up to unlock</span>
                  <div className="h-1 w-24 mx-auto rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notification History Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Dispatched Push History</h2>
          <span className="text-xs text-text-tertiary">Last 30 Dispatches</span>
        </div>

        <Card className="p-0 overflow-hidden border-border-default bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3">Alert Title & Content</th>
                  <th className="px-4 py-3">Audience Target</th>
                  <th className="px-4 py-3">Delivery Status</th>
                  <th className="px-4 py-3">Sent Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-text-tertiary">
                      No push notifications sent yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-subtle transition-fast">
                      <td className="px-4 py-3 max-w-md">
                        <div className="font-semibold text-text-primary">{l.title}</div>
                        <div className="text-[11px] text-text-tertiary line-clamp-1 mt-0.5">{l.body}</div>
                      </td>
                      <td className="px-4 py-3">
                        {l.targetAudience === 'ALL' ? (
                          <Badge variant="neutral">All Registered Players</Badge>
                        ) : (
                          <Badge variant="info">User: {l.userId || 'Single'}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-status-positive font-medium">
                          <Check className="h-3 w-3" /> Delivered ({l.deviceCount || 1} devices)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-tertiary">
                        {new Date(l.sentAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
