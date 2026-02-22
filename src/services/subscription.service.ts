import api from './api';
import type { ApiResponse } from '../types';

export const subscriptionService = {
  getSubscription: () =>
    api.get<ApiResponse<any>>('/subscription'),

  subscribe: (plan: 'monthly' | 'yearly', receipt: string, platform: 'apple' | 'google') =>
    api.post<ApiResponse<any>>('/subscription/subscribe', { plan, receipt, platform }),

  cancel: () =>
    api.post<ApiResponse<any>>('/subscription/cancel'),
};
