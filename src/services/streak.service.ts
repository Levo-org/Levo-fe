import api from './api';
import type { ApiResponse, StreakData } from '../types';

export const streakService = {
  getStreak: () =>
    api.get<ApiResponse<StreakData>>('/streak'),

  syncDailyGoalProgress: (minutesStudied: number) =>
    api.post<ApiResponse<{ currentStreak: number; todayCompleted: boolean }>>('/streak/progress', {
      minutesStudied,
    }),

  useShield: () =>
    api.post<ApiResponse<any>>('/streak/shield'),
};
