'use client';
import React from 'react';
import { Check, X, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const ROLES = [
  {
    name: 'SUPER_ADMIN',
    title: 'Super Administrator',
    description: 'Full unconstrained platform control, staff provisioning, wallet adjustments, and system overrides.',
    badgeVariant: 'info' as const
  },
  {
    name: 'FINANCE_ADMIN',
    title: 'Finance Administrator',
    description: 'Authority over user balances, deposit approvals, withdrawal disbursements, and ledger reconciliation.',
    badgeVariant: 'positive' as const
  },
  {
    name: 'GAME_OPERATOR',
    title: 'Game Operator',
    description: 'Game catalog state, round timing configuration, maintenance toggles, and live engine oversight.',
    badgeVariant: 'info' as const
  },
  {
    name: 'SUPPORT_ADMIN',
    title: 'Player Support Specialist',
    description: 'Player profile lookup, account notes, ban/unban enforcement, and dispute review.',
    badgeVariant: 'warning' as const
  },
  {
    name: 'VIEWER',
    title: 'Auditor / Viewer',
    description: 'Read-only telemetry access across games, users, ledger and reports with zero mutation privileges.',
    badgeVariant: 'neutral' as const
  }
];

const PERMISSIONS = [
  { key: 'users.read', label: 'View Players', desc: 'Browse player list, view balances and betting history' },
  { key: 'users.manage', label: 'Manage Players', desc: 'Suspend, ban, unban, and record operator notes' },
  { key: 'wallet.read', label: 'View Wallets & Ledger', desc: 'Inspect authoritative double-entry wallet ledger' },
  { key: 'wallet.adjust', label: 'Adjust Player Wallets', desc: 'Execute transactional credit/debit on bucket balances' },
  { key: 'payments.read', label: 'View Payments', desc: 'Monitor pending deposit and withdrawal queues' },
  { key: 'payments.approve', label: 'Settle Payments', desc: 'Approve or reject player deposits and UPI payouts' },
  { key: 'games.read', label: 'View Games', desc: 'Inspect game catalog, active rounds and engine telemetry' },
  { key: 'games.manage', label: 'Configure Games', desc: 'Modify round durations, maintenance banners, and catalog status' },
  { key: 'reports.read', label: 'View & Export Reports', desc: 'Access platform KPI summaries, GGR metrics, and CSV exports' },
  { key: 'system.manage', label: 'System Settings', desc: 'Control platform risk limits, announcements and health' },
  { key: 'admins.manage', label: 'Manage Staff Accounts', desc: 'Provision and deactivate administrative credentials' },
  { key: 'audit.read', label: 'Read Audit Logs', desc: 'Inspect immutable operator audit trails' },
];

const MATRIX: Record<string, string[]> = {
  SUPER_ADMIN: [
    'users.read', 'users.manage', 'wallet.read', 'wallet.adjust',
    'payments.read', 'payments.approve', 'games.read', 'games.manage',
    'reports.read', 'system.manage', 'admins.manage', 'audit.read'
  ],
  FINANCE_ADMIN: [
    'users.read', 'wallet.read', 'wallet.adjust',
    'payments.read', 'payments.approve', 'reports.read', 'audit.read'
  ],
  GAME_OPERATOR: [
    'users.read', 'games.read', 'games.manage',
    'reports.read', 'system.manage', 'audit.read'
  ],
  SUPPORT_ADMIN: [
    'users.read', 'users.manage', 'wallet.read',
    'reports.read', 'audit.read'
  ],
  VIEWER: [
    'users.read', 'games.read', 'wallet.read',
    'payments.read', 'reports.read', 'audit.read'
  ]
};

export default function RolesMatrixPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">Role-Based Access Control (RBAC)</h1>
            <Badge variant="positive">Server Enforced</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-1">Authoritative permissions matrix verified on every backend API request</p>
        </div>
      </div>

      {/* Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => (
          <Card key={r.name} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant={r.badgeVariant}>
                  {r.name}
                </Badge>
                <Lock className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
              <h3 className="mt-2 text-sm font-semibold text-text-primary">{r.title}</h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">{r.description}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-border-muted text-xs font-mono text-text-tertiary">
              {MATRIX[r.name]?.length || 0} active permissions
            </div>
          </Card>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Permission Entitlement Matrix</h2>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="border-b border-border-default bg-surface-base text-text-tertiary uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="px-4 py-3 min-w-[220px]">Granular Permission</th>
                  <th className="px-3 py-3 text-center">SUPER_ADMIN</th>
                  <th className="px-3 py-3 text-center">FINANCE_ADMIN</th>
                  <th className="px-3 py-3 text-center">GAME_OPERATOR</th>
                  <th className="px-3 py-3 text-center">SUPPORT_ADMIN</th>
                  <th className="px-3 py-3 text-center">VIEWER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-muted text-xs">
                {PERMISSIONS.map((perm) => (
                  <tr key={perm.key} className="hover:bg-surface-subtle transition-fast">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{perm.label}</div>
                      <div className="text-[11px] text-text-tertiary font-mono">{perm.key} • {perm.desc}</div>
                    </td>
                    {['SUPER_ADMIN', 'FINANCE_ADMIN', 'GAME_OPERATOR', 'SUPPORT_ADMIN', 'VIEWER'].map((role) => {
                      const hasPerm = MATRIX[role]?.includes(perm.key);
                      return (
                        <td key={role} className="px-3 py-3 text-center">
                          {hasPerm ? (
                            <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-status-positive/10 text-status-positive border border-status-positive/20">
                              <Check className="h-3 w-3" />
                            </div>
                          ) : (
                            <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-subtle text-text-tertiary">
                              <X className="h-3 w-3" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
