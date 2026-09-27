'use client';
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Loader2,
  Send,
  Bell,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Push notification state
  const [pushTitle, setPushTitle] = useState('🎁 Special Reward Alert!');
  const [pushBody, setPushBody] = useState('New cashback and bonus added to your wallet! Play XO Battle now.');
  const [pushTarget, setPushTarget] = useState('ALL');
  const [pushUserId, setPushUserId] = useState('');
  const [pushSending, setPushSending] = useState(false);
  const [pushSuccessMsg, setPushSuccessMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAnnouncements();
      if (res.success && Array.isArray(res.data)) {
        setAnnouncements(res.data);
      } else {
        setAnnouncements([]);
      }
    } catch (err: any) {
      console.error('Fetch announcements error:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushBody.trim()) return;

    try {
      setPushSending(true);
      setPushSuccessMsg(null);
      const res = await adminService.sendPushNotification({
        title: pushTitle.trim() || 'Game In Play Alert',
        body: pushBody.trim(),
        targetAudience: pushTarget,
        userId: pushTarget === 'SINGLE' ? pushUserId.trim() : undefined
      });

      if (res.success) {
        setPushSuccessMsg(res.message || 'Push notification successfully broadcast to players mobile devices!');
      } else {
        alert(res.message || 'Failed to send push notification');
      }
    } catch (err: any) {
      alert(`Error sending push notification: ${err.response?.data?.message || err.message}`);
    } finally {
      setPushSending(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      const res = await adminService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type
      });
      if (res.success) {
        setTitle('');
        setMessage('');
        setType('INFO');
        await fetchAnnouncements();
      } else {
        alert(res.message || 'Failed to broadcast announcement');
      }
    } catch (err: any) {
      alert(`Error broadcasting announcement: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const res = await adminService.toggleAnnouncementStatus(id, !currentStatus);
      if (res.success) {
        await fetchAnnouncements();
      } else {
        alert(res.message || 'Failed to toggle status');
      }
    } catch (err: any) {
      alert(`Error toggling: ${err.response?.data?.message || err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Push Notifications & Broadcasts</h1>
            <Badge variant="positive">Firebase Push Active</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Send instant mobile push alerts to lock screens, notification trays and in-app banners</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {pushSuccessMsg && (
        <div className="flex items-center gap-2 rounded-md border border-status-positive/20 bg-status-positive/10 p-3 text-xs text-status-positive">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{pushSuccessMsg}</span>
        </div>
      )}

      {/* Instant Mobile Push Notification Card */}
      <Card as="form" onSubmit={handleSendPush} className="space-y-4 border-accent-primary/20 bg-surface-raised">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-accent-primary" />
            <h2 className="text-sm font-semibold text-text-primary">Instant Mobile Push Notification (Phone Tray & Lock Screen)</h2>
          </div>
          <Badge variant="info">FCM Live</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-text-secondary mb-1 font-medium">Notification Title</label>
            <input
              type="text"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
              placeholder="e.g. 🎁 Weekend Bonus Alert!"
              className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-1 font-medium">Target Audience</label>
            <select
              value={pushTarget}
              onChange={(e) => setPushTarget(e.target.value)}
              className="w-full h-8 rounded border border-border-default bg-surface-base px-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              <option value="ALL">All Registered Players (Broadcast)</option>
              <option value="SINGLE">Single Player (By User ID / Phone)</option>
            </select>
          </div>

          {pushTarget === 'SINGLE' && (
            <div>
              <label className="block text-text-secondary mb-1 font-medium">Target User ID</label>
              <input
                type="text"
                value={pushUserId}
                onChange={(e) => setPushUserId(e.target.value)}
                placeholder="Enter userId (e.g. usr_12345)"
                className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-text-secondary mb-1 font-medium text-xs">Push Notification Message</label>
          <textarea
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            placeholder="Message that pops up on player's mobile notification bar and lock screen..."
            className="w-full h-16 rounded border border-border-default bg-surface-base p-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-text-tertiary">
            ⚡ Pops up on lock screen & status bar even when app is closed
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={pushSending || !pushBody.trim()}
            isLoading={pushSending}
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            <span>Send Mobile Push Alert</span>
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {/* Broadcast Form */}
      <Card as="form" onSubmit={handleCreate} className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-accent-primary" />
          <span>Create New Player Broadcast</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block text-text-secondary mb-1 font-medium">Broadcast Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Network Maintenance Tonight at 02:00 IST"
              className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            />
          </div>

          <div>
            <label className="block text-text-secondary mb-1 font-medium">Priority Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-8 rounded border border-border-default bg-surface-base px-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              <option value="INFO">INFO (General Information)</option>
              <option value="WARNING">WARNING (Maintenance / Advisory)</option>
              <option value="URGENT">URGENT (Critical Notice)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-text-secondary mb-1 font-medium text-xs">Message Body</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Detailed description visible in player notification center..."
            className="w-full h-20 rounded border border-border-default bg-surface-base p-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={submitting || !title.trim() || !message.trim()}
            isLoading={submitting}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish Broadcast</span>
          </Button>
        </div>
      </Card>

      {/* Announcements List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Broadcast History & Active Banners</h2>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3">Headline & Details</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Published At</th>
                  <th className="px-4 py-3 text-center">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-text-tertiary">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent-primary mb-2" />
                      <span>Loading announcements...</span>
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-text-tertiary">
                      No announcements published yet.
                    </td>
                  </tr>
                ) : (
                  announcements.map((a) => {
                    const isToggling = togglingId === a.id;
                    return (
                      <tr key={a.id} className="hover:bg-surface-subtle transition-fast">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text-primary">{a.title}</div>
                          <p className="text-xs text-text-tertiary line-clamp-1 mt-0.5">{a.message}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              a.type === 'URGENT' ? 'negative' : a.type === 'WARNING' ? 'warning' : 'info'
                            }
                          >
                            {a.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 font-medium text-xs ${
                            a.is_active ? 'text-status-positive' : 'text-text-tertiary'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? 'bg-status-positive animate-pulse' : 'bg-text-tertiary'}`} />
                            {a.is_active ? 'LIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-tertiary font-mono text-xs">
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant={a.is_active ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggle(a.id, a.is_active)}
                            disabled={isToggling}
                            isLoading={isToggling}
                          >
                            {a.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
