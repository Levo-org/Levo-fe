import api from './api';
import type { ApiResponse, ListeningPracticeItem } from '../types';

const PAGE_SIZE = 100;

const fetchAllProblems = async (): Promise<ApiResponse<ListeningPracticeItem[]>> => {
  const items: ListeningPracticeItem[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await api.get<ApiResponse<ListeningPracticeItem[]>>('/listening', {
      params: { page, limit: PAGE_SIZE },
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

export const listeningService = {
  getProblems: async () => ({
    data: await fetchAllProblems(),
  }),

  answerProblem: (id: string, answer: string) =>
    api.post<ApiResponse<{ correct: boolean; correctAnswer: string; heartsRemaining: number; xpEarned: number }>>(`/listening/${id}/answer`, { answer }),
};
