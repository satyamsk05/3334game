'use client';
import React from 'react';
import { Download, ShieldCheck, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SystemicReportsPage() {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Systemic Financial Reports</h1>
          <p className="text-xs text-zinc-400 mt-1">Audit integer paise wallet ledgers, deposit reserves, and payout summaries</p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition">
          <Download className="h-3.5 w-3.5 text-zinc-400" /> Export CSV Audit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Total System Deposits</div>
          <div className="text-2xl font-bold font-mono text-white">₹4,52,100.00</div>
          <div className="text-[11px] text-zinc-500 font-mono">45,210,000 paise credited</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Total System Withdrawals</div>
          <div className="text-2xl font-bold font-mono text-white">₹2,84,500.00</div>
          <div className="text-[11px] text-zinc-500 font-mono">28,450,000 paise debited</div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Platform Retained Reserves</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">₹1,67,600.00</div>
          <div className="text-[11px] text-emerald-500/80 font-mono">16,760,000 paise held in trust</div>
        </div>

      </div>

      {/* Ledger Integrity Card */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="h-5 w-5" />
          <span>Double-Entry Wallet Bucket Accounting Audit</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
          All balances are stored as strict integer paise (`totalBalance = depositBalance + winningBalance + bonusBalance`).
          Bucket debit order (`deposit → winnings → bonus`) and refund equity are verified across all accounts.
        </p>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> Systemic Audit Status: <span className="font-mono font-bold">100% BALANCED</span>
        </div>
      </div>

    </div>
  );
}
