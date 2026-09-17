import { api } from './api';

export const paymentService = {
  getDeposits: async () => {
    const res = await api.get('/payments/deposits');
    return res.data;
  },
  approveDeposit: async (depositId: string) => {
    const res = await api.post('/payments/deposit/approve', { depositId });
    return res.data;
  },
  rejectDeposit: async (depositId: string) => {
    const res = await api.post('/payments/deposit/reject', { depositId });
    return res.data;
  },
  getWithdrawals: async () => {
    const res = await api.get('/payments/withdrawals');
    return res.data;
  },
  approveWithdrawal: async (withdrawalId: string) => {
    const res = await api.post('/payments/withdraw/approve', { withdrawalId });
    return res.data;
  },
  rejectWithdrawal: async (withdrawalId: string) => {
    const res = await api.post('/payments/withdraw/reject', { withdrawalId });
    return res.data;
  }
};
