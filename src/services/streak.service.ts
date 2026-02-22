import api from './api';
import type { ApiResponse, StreakData } from '../types';

export const streakService = {
  getStreak: () =>
    api.get<ApiResponse<StreakData>>('/streak'),

  useShield: () =>
    api.post<ApiResponse<any>>('/streak/shield'),
};
