import api from './api';
import type { ApiResponse, LessonUnit } from '../types';

export const lessonService = {
  getLessons: () =>
    api.get<ApiResponse<{ units: LessonUnit[] }>>('/lessons'),

  getLessonDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/lessons/${id}`),

  startLesson: (id: string) =>
    api.post<ApiResponse<any>>(`/lessons/${id}/start`),

  completeLesson: (id: string, data: { score: number; correctCount: number; totalQuestions: number; timeSpentSeconds: number }) =>
    api.post<ApiResponse<{ xpEarned: number; coinsEarned: number; streakUpdated: boolean; currentStreak: number; newBadges: any[]; nextLessonUnlocked: boolean }>>(`/lessons/${id}/complete`, data),
};
