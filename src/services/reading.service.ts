import api from './api';
import type { ApiResponse, ReadingPracticePassage } from '../types';

const PAGE_SIZE = 100;

const fetchAllPassages = async (params?: { targetLanguage?: string; difficulty?: string }): Promise<ApiResponse<ReadingPracticePassage[]>> => {
  const items: ReadingPracticePassage[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await api.get<ApiResponse<ReadingPracticePassage[]>>('/reading', {
      params: { page, limit: PAGE_SIZE, ...params },
    });

    if (!response.data.success) {
      return response.data;
    }

    items.push(...response.data.data);
    totalPages = response.data.pagination?.totalPages ?? 1;
    page += 1;
  }

  return {
    success: true,
    data: items,
  };
};

export const readingService = {
  getPassages: async (params?: { targetLanguage?: string; difficulty?: string }) => ({
    data: await fetchAllPassages(params),
  }),

  getDetail: (id: string) =>
    api.get<ApiResponse<ReadingPracticePassage>>(`/reading/${id}`),

  answerQuiz: (id: string, quizIndex: number, selectedAnswer: number) =>
    api.post<ApiResponse<{ correct: boolean; correctAnswer: number | string; explanation?: string }>>(`/reading/${id}/quiz/answer`, { quizIndex, selectedAnswer }),
};
