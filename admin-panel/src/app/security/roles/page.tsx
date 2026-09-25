'use client';
import React from 'react';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';

const ROLES = [
  {
    name: 'SUPER_ADMIN',
    title: 'Super Administrator',
    description: 'Full unconstrained platform control, staff provisioning, wallet adjustments, and system overrides.',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  },
  {
    name: 'FINANCE_ADMIN',
    title: 'Finance Administrator',
    description: 'Authority over user balances, deposit approvals, withdrawal disbursements, and ledger reconciliation.',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  {
    name: 'GAME_OPERATOR',
    title: 'Game Operator',
    description: 'Game catalog state, round timing configuration, maintenance toggles, and live engine oversight.',
    badgeColor: 'bg-[#2988ff]/10 text-[#2988ff] border-[#2988ff]/20'
  },
  {
    name: 'SUPPORT_ADMIN',
    title: 'Player Support Specialist',
    description: 'Player profile lookup, account notes, ban/unban enforcement, and dispute review.',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  {
    name: 'VIEWER',
    title: 'Auditor / Viewer',
    description: 'Read-only telemetry access across games, users, ledger and reports with zero mutation privileges.',
    badgeColor: 'bg-white/[0.04] text-[#8c8c8c] border-white/[0.08]'
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-[#e1e1e1]">Role-Based Access Control (RBAC)</h1>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-mono text-emerald-400 border border-emerald-500/20">
              Server Enforced
            </span>
          </div>
          <p className="text-[12px] text-[#a6a6a6] mt-0.5">Authoritative permissions matrix verified on every backend API request</p>
        </div>
      </div>

      {/* Roles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ROLES.map((r) => (
          <div key={r.name} className="rounded-[8px] border border-white/[0.08] bg-[#212123] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-[3px] text-[10.5px] font-mono font-semibold border ${r.badgeColor}`}>
                  {r.name}
                </span>
                <Lock className="h-3.5 w-3.5 text-[#666]" />
              </div>
              <h3 className="mt-2 text-[13px] font-semibold text-[#e1e1e1]">{r.title}</h3>
              <p className="mt-1 text-[11.5px] text-[#8c8c8c] leading-relaxed">{r.description}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/[0.04] text-[11px] font-mono text-[#666]">
              {MATRIX[r.name]?.length || 0} active permissions
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Matrix Table */}
      <div className="space-y-3">
        <h2 className="text-[13px] font-semibold text-[#e1e1e1]">Permission Entitlement Matrix</h2>

        <div className="overflow-x-auto rounded-[8px] border border-white/[0.08] bg-[#212123]">
          <table className="w-full text-left text-[12px] text-[#a6a6a6]">
            <thead className="border-b border-white/[0.08] bg-black text-[#8c8c8c] uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="px-4 py-3 min-w-[220px]">Granular Permission</th>
                <th className="px-3 py-3 text-center">SUPER_ADMIN</th>
                <th className="px-3 py-3 text-center">FINANCE_ADMIN</th>
                <th className="px-3 py-3 text-center">GAME_OPERATOR</th>
                <th className="px-3 py-3 text-center">SUPPORT_ADMIN</th>
                <th className="px-3 py-3 text-center">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[11.5px]">
              {PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#e1e1e1]">{perm.label}</div>
                    <div className="text-[10.5px] text-[#666] font-mono">{perm.key} • {perm.desc}</div>
                  </td>
                  {['SUPER_ADMIN', 'FINANCE_ADMIN', 'GAME_OPERATOR', 'SUPPORT_ADMIN', 'VIEWER'].map((role) => {
                    const hasPerm = MATRIX[role]?.includes(perm.key);
                    return (
                      <td key={role} className="px-3 py-3 text-center">
                        {hasPerm ? (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.02] text-[#444]">
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
      </div>

    </div>
  );
}
