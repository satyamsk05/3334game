import { api } from './api';

export const userService = {
  getAllUsers: async () => {
    const res = await api.get('/users/all');
    return res.data;
  },
  toggleBan: async (userId: string, isBanned: boolean) => {
    const res = await api.post('/users/toggle-ban', { userId, isBanned });
    return res.data;
  }
};
