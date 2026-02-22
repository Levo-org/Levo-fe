import api from './api';
import type { ApiResponse } from '../types';

export const statsService = {
  getStats: (period?: 'week' | 'month' | 'all') =>
    api.get<ApiResponse<any>>('/stats', { params: { period } }),
};
