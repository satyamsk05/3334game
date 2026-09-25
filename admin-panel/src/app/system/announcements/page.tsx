'use client';
import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bell,
  Clock,
  Send,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { adminService } from '@/services/adminService';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Broadcast Announcements</h1>
            <span className="rounded-full bg-[#2988ff]/10 px-2 py-0.5 text-[10.5px] font-mono text-[#2988ff] border border-[#2988ff]/20">
              Live Broadcast
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Push system maintenance, promotional and platform updates to all players</p>
        </div>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleCreate} className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-5 space-y-4">
        <h2 className="text-[13px] font-semibold text-[#e1e1e1] flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#2988ff]" />
          <span>Create New Player Broadcast</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
          <div className="sm:col-span-2">
            <label className="block text-[#a6a6a6] mb-1 font-medium">Broadcast Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Network Maintenance Tonight at 02:00 IST"
              className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#a6a6a6] mb-1 font-medium">Priority Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
            >
              <option value="INFO">INFO (General Information)</option>
              <option value="WARNING">WARNING (Maintenance / Advisory)</option>
              <option value="URGENT">URGENT (Critical Notice)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[#a6a6a6] mb-1 font-medium text-[12px]">Message Body</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Detailed description visible in player notification center..."
            className="w-full h-20 rounded-[4px] border border-white/[0.08] bg-black p-2.5 text-[12px] text-[#e1e1e1] placeholder-[#666] focus:border-[#2988ff] focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !message.trim()}
            className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-4 py-1.5 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50 transition-all shadow-sm"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            <span>Publish Broadcast</span>
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-3">
        <h2 className="text-[13px] font-semibold text-[#e1e1e1]">Broadcast History & Active Banners</h2>

        <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3">Headline & Details</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published At</th>
                <th className="px-4 py-3 text-center">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[11.5px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#8c8c8c]">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2988ff] mb-2" />
                    <span>Loading announcements...</span>
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[#8c8c8c]">
                    No announcements published yet.
                  </td>
                </tr>
              ) : (
                announcements.map((a) => {
                  const isToggling = togglingId === a.id;
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#e1e1e1]">{a.title}</div>
                        <p className="text-[11px] text-[#8c8c8c] line-clamp-1 mt-0.5">{a.message}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-[3px] text-[10.5px] font-mono font-semibold ${
                          a.type === 'URGENT' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          a.type === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20'
                        }`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 font-medium text-[11px] ${
                          a.is_active ? 'text-emerald-400' : 'text-[#666]'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-[#666]'}`} />
                          {a.is_active ? 'LIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8c8c8c] font-mono text-[11px]">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggle(a.id, a.is_active)}
                          disabled={isToggling}
                          className="rounded-[3px] border border-white/[0.08] px-2.5 py-1 text-[11px] hover:border-white/20 transition-all text-[#a6a6a6] hover:text-[#e1e1e1]"
                        >
                          {isToggling ? <Loader2 className="h-3 w-3 animate-spin" /> : a.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
