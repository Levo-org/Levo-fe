import api from './api';
import type { ApiResponse } from '../types';

export const coinService = {
  getCoins: () =>
    api.get<ApiResponse<any>>('/coins'),

  earnCoins: (reason: 'ad_watch' | 'daily_check' | 'friend_invite') =>
    api.post<ApiResponse<any>>('/coins/earn', { reason }),

  spendCoins: (item: string, quantity?: number) =>
    api.post<ApiResponse<any>>('/coins/spend', { item, quantity: quantity || 1 }),
};
