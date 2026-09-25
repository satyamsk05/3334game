'use client';
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Administrative Staff</h1>
            <Badge variant="positive">RBAC Protected</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Authoritative operator accounts, role boundaries and session governance</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          aria-label="Create staff account"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Staff Account</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-status-negative/20 bg-status-negative/10 p-3 text-xs text-status-negative">
          {error}
        </div>
      )}

      {/* Admins Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-text-secondary">
            <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3">Admin Username</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Account ID</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-tertiary">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-accent-primary mb-2" />
                    <span>Loading administrative accounts...</span>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-tertiary">
                    No staff accounts configured. Default root admin active via environment.
                  </td>
                </tr>
              ) : (
                admins.map((a) => {
                  const isToggling = togglingId === a.id;
                  return (
                    <tr key={a.id} className="hover:bg-surface-subtle transition-fast">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded bg-surface-subtle font-semibold text-text-primary text-xs">
                            {a.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-text-primary">{a.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <Badge
                          variant={
                            a.role === 'SUPER_ADMIN' ? 'info' :
                            a.role === 'FINANCE_ADMIN' ? 'positive' :
                            a.role === 'GAME_OPERATOR' ? 'info' :
                            'neutral'
                          }
                        >
                          {a.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          a.is_active ? 'text-status-positive' : 'text-status-negative'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${a.is_active ? 'bg-status-positive' : 'bg-status-negative'}`} />
                          {a.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-tertiary text-xs">
                        {a.id}
                      </td>
                      <td className="px-4 py-3 font-mono text-text-tertiary text-xs">
                        {new Date(a.created_at).toLocaleDateString()}
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

      {/* New Admin Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border-default bg-surface-strong p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-muted pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent-primary" />
                <h3 className="text-sm font-semibold text-text-primary">Create Staff Account</h3>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="text-text-tertiary hover:text-text-primary p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 rounded border border-status-negative/20 bg-status-negative/10 p-2 text-xs text-status-negative">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-text-secondary mb-1 font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ops_sarah"
                  className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1 font-medium">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-8 rounded border border-border-default bg-surface-base px-2.5 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1 font-medium">RBAC Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-8 rounded border border-border-default bg-surface-base px-2 text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                >
                  <option value="VIEWER">VIEWER (Read-only analytics)</option>
                  <option value="SUPPORT_ADMIN">SUPPORT_ADMIN (Users & support notes)</option>
                  <option value="GAME_OPERATOR">GAME_OPERATOR (Games & engine config)</option>
                  <option value="FINANCE_ADMIN">FINANCE_ADMIN (Wallet & deposits/withdrawals)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Full platform permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-muted">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={creating}
                  isLoading={creating}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
