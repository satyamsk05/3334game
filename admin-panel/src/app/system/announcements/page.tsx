'use client';
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Loader2,
  Send
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
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Broadcast Announcements</h1>
            <Badge variant="info">Live Broadcast</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Push system maintenance, promotional and platform updates to all players</p>
        </div>
      </div>

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
