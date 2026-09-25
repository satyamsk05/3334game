'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { adminService } from '@/services/adminService';

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New admin modal
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAdmins();
      if (res.success && Array.isArray(res.data)) {
        setAdmins(res.data);
      } else {
        setAdmins([]);
      }
    } catch (err: any) {
      console.error('Fetch admins error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load admin accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!username.trim() || !password.trim()) {
      setModalError('Username and password are required');
      return;
    }
    if (password.length < 8) {
      setModalError('Password must be at least 8 characters long');
      return;
    }

    try {
      setCreating(true);
      const res = await adminService.createAdmin({
        username: username.trim(),
        password: password.trim(),
        role
      });
      if (res.success) {
        setModalOpen(false);
        setUsername('');
        setPassword('');
        setRole('VIEWER');
        await fetchAdmins();
      } else {
        setModalError(res.message || 'Failed to create admin');
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || 'Creation error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const res = await adminService.toggleAdminActive(id, !currentStatus);
      if (res.success) {
        await fetchAdmins();
      } else {
        alert(res.message || 'Status update failed');
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
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Administrative Staff</h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-mono text-emerald-400 border border-emerald-500/20">
              RBAC Protected
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative operator accounts, role boundaries and session governance</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-3 text-[12px] font-medium text-white hover:bg-[#2988ff]/90 transition-all shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Staff Account</span>
        </button>
      </div>

      {error && (
        <div className="rounded-[6px] border border-red-500/20 bg-red-500/10 p-3 text-[12px] text-red-400">
          {error}
        </div>
      )}

      {/* Admins Table */}
      <div className="overflow-hidden rounded-[8px] border border-white/[0.08] bg-[#212123]">
        <table className="w-full text-left text-[12px] text-[#a6a6a6]">
          <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
            <tr>
              <th className="px-4 py-3">Admin Username</th>
              <th className="px-4 py-3">Assigned Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Account ID</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-[11.5px]">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[#8c8c8c]">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#2988ff] mb-2" />
                  <span>Loading administrative accounts...</span>
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#8c8c8c]">
                  No staff accounts configured. Default root admin active via environment.
                </td>
              </tr>
            ) : (
              admins.map((a) => {
                const isToggling = togglingId === a.id;
                return (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-white/[0.05] font-semibold text-[#e1e1e1]">
                          {a.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#e1e1e1]">{a.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-semibold border ${
                        a.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        a.role === 'FINANCE_ADMIN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        a.role === 'GAME_OPERATOR' ? 'bg-[#2988ff]/10 text-[#2988ff] border border-[#2988ff]/20' :
                        'bg-white/[0.04] text-[#8c8c8c] border-white/[0.08]'
                      }`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                        a.is_active ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {a.is_active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#8c8c8c] text-[11px]">
                      {a.id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#8c8c8c] text-[11px]">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(a.id, a.is_active)}
                        disabled={isToggling}
                        className={`rounded-[3px] border px-2.5 py-1 text-[11px] font-medium transition-all ${
                          a.is_active
                            ? 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
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

      {/* New Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[8px] border border-white/[0.12] bg-[#212123] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2988ff]" />
                <h3 className="text-sm font-semibold text-[#e1e1e1]">Create Staff Account</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#8c8c8c] hover:text-[#e1e1e1]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 rounded-[4px] border border-red-500/20 bg-red-500/10 p-2 text-[11.5px] text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-[12px]">
              <div>
                <label className="block text-[#a6a6a6] mb-1 font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ops_sarah"
                  className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#a6a6a6] mb-1 font-medium">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2.5 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#a6a6a6] mb-1 font-medium">RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-8 rounded-[4px] border border-white/[0.08] bg-black px-2 text-[#e1e1e1] focus:border-[#2988ff] focus:outline-none"
                >
                  <option value="VIEWER">VIEWER (Read-only analytics)</option>
                  <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Users & support notes)</option>
                  <option value="GAME_OPERATOR">GAME_OPERATOR (Games & engine config)</option>
                  <option value="FINANCE_ADMIN">FINANCE_ADMIN (Wallet & deposits/withdrawals)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full platform permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-[4px] border border-white/[0.08] px-3 py-1.5 text-[#8c8c8c] hover:text-[#e1e1e1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 rounded-[4px] bg-[#2988ff] px-4 py-1.5 font-medium text-white hover:bg-[#2988ff]/90 disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
