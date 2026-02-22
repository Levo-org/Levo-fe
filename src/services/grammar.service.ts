import api from './api';
import type { ApiResponse, GrammarTopic } from '../types';

export const grammarService = {
  getTopics: (level?: string) =>
    api.get<ApiResponse<GrammarTopic[]>>('/grammar', { params: { level } }),

  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/grammar/${id}`),

  getQuiz: (id: string) =>
    api.get<ApiResponse<any>>(`/grammar/${id}/quiz`),

  answerQuiz: (id: string, quizIndex: number, selectedAnswer: number) =>
    api.post<ApiResponse<{ correct: boolean; correctAnswer: number; explanation: string; heartsRemaining: number; xpEarned: number }>>(`/grammar/${id}/quiz/answer`, { quizIndex, selectedAnswer }),
};
