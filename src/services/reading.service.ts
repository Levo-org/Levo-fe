import api from './api';
import type { ApiResponse } from '../types';

export const readingService = {
  getPassages: () =>
    api.get<ApiResponse<any>>('/reading'),

  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/reading/${id}`),

  answerQuiz: (id: string, quizIndex: number, selectedAnswer: number) =>
    api.post<ApiResponse<any>>(`/reading/${id}/quiz/answer`, { quizIndex, selectedAnswer }),
};
