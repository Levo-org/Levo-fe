import api from './api';
import type { ApiResponse } from '../types';

export const quizService = {
  getDailyQuiz: () =>
    api.get<ApiResponse<any>>('/quiz/daily'),

  answerQuestion: (data: { questionId: string; selectedAnswer: number }) =>
    api.post<ApiResponse<any>>('/quiz/answer', data),

  completeQuiz: (data: { score: number; correctCount: number; totalQuestions: number }) =>
    api.post<ApiResponse<any>>('/quiz/complete', data),
};
