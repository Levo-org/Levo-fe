import api from './api';
import type { ApiResponse } from '../types';

export const listeningService = {
  getProblems: () =>
    api.get<ApiResponse<any>>('/listening'),

  answerProblem: (id: string, answer: string) =>
    api.post<ApiResponse<{ correct: boolean; correctAnswer: string; heartsRemaining: number; xpEarned: number }>>(`/listening/${id}/answer`, { answer }),
};
