import api from './api';
import type { ApiResponse, Badge } from '../types';

export const badgeService = {
  getBadges: (category?: string) =>
    api.get<ApiResponse<{ achievedCount: number; totalCount: number; badges: Badge[] }>>('/badges', { params: { category } }),
};
