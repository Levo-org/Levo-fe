import api from './api';
import type { ApiResponse, Badge } from '../types';

type BadgeCategory = 'all' | 'streak' | 'learning' | 'level' | 'special';

export const badgeService = {
  getBadges: (category?: BadgeCategory) =>
    api.get<ApiResponse<{ achievedCount: number; totalCount: number; badges: Badge[] }>>('/badges', { params: { category } }),
};
