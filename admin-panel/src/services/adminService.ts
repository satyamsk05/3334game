import { api } from './api';

export interface UserSummary {
  id: string;
  phone: string;
  name: string;
  is_blocked: boolean;
  block_reason?: string;
  created_at: string;
  updated_at: string;
  deposit_balance: string;
  winnings_balance: string;
  rewards_balance: string;
  available_balance: string;
  total_bets: string;
  total_wagered: string;
  total_won: string;
}

export interface UserDetailsResponse {
  user: {
    id: string;
    phone: string;
    name: string;
    is_blocked: boolean;
    block_reason?: string;
    created_at: string;
    updated_at: string;
  };
  wallet: {
    deposit_balance: string;
    winnings_balance: string;
    rewards_balance: string;
    available_balance: string;
    total_deposited: string;
    total_withdrawn: string;
  };
  metrics: {
    totalBets: number;
    totalWageredPaise: string;
    totalWonPaise: string;
    ggrPaise: string;
  };
  recentTransactions: Array<{
    id: string;
    transaction_type: string;
    amount: string;
    bucket: string;
    balance_before: string;
    balance_after: string;
    reference_id: string;
    description: string;
    created_at: string;
  }>;
  recentBets: Array<{
    id: string;
    round_id: string;
    selected_option: string;
    bet_amount: string;
    payout_amount: string;
    status: string;
    created_at: string;
  }>;
  deposits: Array<{
    id: string;
    amount: string;
    utr: string;
    status: string;
    created_at: string;
  }>;
  withdrawals: Array<{
    id: string;
    amount: string;
    upi_id: string;
    status: string;
    created_at: string;
  }>;
  notes: Array<{
    id: string;
    note: string;
    author_id: string;
    created_at: string;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    details: any;
    created_at: string;
  }>;
}

export interface GameInfo {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: 'LIVE' | 'COMING_SOON' | 'MAINTENANCE';
  display_order: number;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface LedgerItem {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: string;
  bucket: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_id: string;
  description: string;
  created_at: string;
  phone?: string;
  user_name?: string;
}

export interface AuditLogItem {
  id: string;
  admin_id: string;
  action: string;
  target_id: string;
  details: any;
  ip_address: string;
  created_at: string;
}

export const adminService = {
  // Dashboard & Analytics
  getDashboardStats: async (range: string = '30d') => {
    const res = await api.get(`/admin/dashboard/stats?range=${range}`);
    return res.data;
  },

  // Users
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    const res = await api.get(`/admin/users?${query.toString()}`);
    return res.data;
  },

  getUserDetails: async (id: string) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },

  toggleBan: async (id: string, isBlocked: boolean, reason?: string) => {
    const res = await api.post(`/admin/users/${id}/ban`, { isBlocked, reason });
    return res.data;
  },

  addUserNote: async (id: string, note: string) => {
    const res = await api.post(`/admin/users/${id}/notes`, { note });
    return res.data;
  },

  adjustWallet: async (
    id: string,
    data: {
      bucket: 'deposit' | 'winnings' | 'bonus';
      type: 'CREDIT' | 'DEBIT';
      amountRupees: number;
      reason: string;
    }
  ) => {
    const res = await api.post(`/admin/users/${id}/adjust-wallet`, data);
    return res.data;
  },

  adjustUserWallet: async (
    id: string,
    data: {
      bucket: 'deposit' | 'winnings' | 'bonus';
      type: 'CREDIT' | 'DEBIT';
      amountRupees: number;
      reason: string;
    }
  ) => {
    const res = await api.post(`/admin/users/${id}/adjust-wallet`, data);
    return res.data;
  },

  // Games
  getGames: async () => {
    const res = await api.get('/admin/games');
    return res.data;
  },

  getGameDetails: async (id: string) => {
    const res = await api.get(`/admin/games/${id}`);
    return res.data;
  },

  updateGameStatus: async (id: string, status: 'LIVE' | 'COMING_SOON' | 'MAINTENANCE') => {
    const res = await api.patch(`/admin/games/${id}/status`, { status });
    return res.data;
  },

  updateGameConfig: async (id: string, config: any) => {
    const res = await api.patch(`/admin/games/${id}/config`, { config });
    return res.data;
  },

  // Transactions & Ledger
  getLedgerOverview: async () => {
    const res = await api.get('/admin/ledger/overview');
    return res.data;
  },

  queryLedger: async (params: {
    page?: number;
    limit?: number;
    userId?: string;
    transactionType?: string;
    bucket?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.userId) query.append('userId', params.userId);
    if (params.transactionType) query.append('transactionType', params.transactionType);
    if (params.bucket) query.append('bucket', params.bucket);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    const res = await api.get(`/admin/ledger/transactions?${query.toString()}`);
    return res.data;
  },

  // Deposits & Withdrawals
  getDeposits: async () => {
    const res = await api.get('/admin/deposits');
    return res.data;
  },

  approveDeposit: async (depositId: string) => {
    const res = await api.post('/admin/deposits/approve', { depositId });
    return res.data;
  },

  rejectDeposit: async (depositId: string) => {
    const res = await api.post('/admin/deposits/reject', { depositId });
    return res.data;
  },

  getWithdrawals: async () => {
    const res = await api.get('/admin/withdrawals');
    return res.data;
  },

  approveWithdrawal: async (withdrawalId: string) => {
    const res = await api.post('/admin/withdrawals/approve', { withdrawalId });
    return res.data;
  },

  rejectWithdrawal: async (withdrawalId: string) => {
    const res = await api.post('/admin/withdrawals/reject', { withdrawalId });
    return res.data;
  },

  // System
  getSystemHealth: async () => {
    const res = await api.get('/admin/system/health');
    return res.data;
  },

  getSystemSettings: async () => {
    const res = await api.get('/admin/system/settings');
    return res.data;
  },

  getSettings: async () => {
    const res = await api.get('/admin/system/settings');
    return res.data;
  },

  updateSystemSetting: async (key: string, value: any, description?: string) => {
    const res = await api.patch(`/admin/system/settings/${key}`, { value, description });
    return res.data;
  },

  updateSetting: async (key: string, value: any, description?: string) => {
    const res = await api.patch(`/admin/system/settings/${key}`, { value, description });
    return res.data;
  },

  getAnnouncements: async () => {
    const res = await api.get('/admin/system/announcements');
    return res.data;
  },

  createAnnouncement: async (data: { title: string; message: string; type?: string; expiresAt?: string }) => {
    const res = await api.post('/admin/system/announcements', data);
    return res.data;
  },

  toggleAnnouncementStatus: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/admin/system/announcements/${id}/status`, { isActive });
    return res.data;
  },

  // Security & Admins
  getAdmins: async () => {
    const res = await api.get('/admin/admins');
    return res.data;
  },

  createAdmin: async (data: { username: string; password: string; role: string }) => {
    const res = await api.post('/admin/admins', data);
    return res.data;
  },

  toggleAdminActive: async (id: string, isActive: boolean) => {
    const res = await api.patch(`/admin/admins/${id}/status`, { isActive });
    return res.data;
  },

  getAuditLogs: async (params: { limit?: number; offset?: number; action?: string; adminId?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    if (params.action) query.append('action', params.action);
    if (params.adminId) query.append('adminId', params.adminId);
    const res = await api.get(`/admin/audit-logs?${query.toString()}`);
    return res.data;
  }
};
