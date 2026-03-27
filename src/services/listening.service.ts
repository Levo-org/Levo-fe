import api from './api';
import type { ApiResponse, ListeningPracticeItem } from '../types';

const PRACTICE_BATCH_SIZE = 20;
const REQUEST_TIMEOUT_MS = 15000;

const fetchPracticeProblems = async (params?: { targetLanguage?: string; difficulty?: string }): Promise<ApiResponse<ListeningPracticeItem[]>> => {
  const practiceData = await api
    .get<ApiResponse<ListeningPracticeItem[]>>('/listening/practice', {
      params: { limit: PRACTICE_BATCH_SIZE, ...params },
      timeout: REQUEST_TIMEOUT_MS,
    })
    .then((response) => (response.data?.success ? response.data : null))
    .catch(() => null);

  if (practiceData) {
    return practiceData;
  }

  const fallback = await api.get<ApiResponse<ListeningPracticeItem[]>>('/listening', {
    params: { page: 1, limit: PRACTICE_BATCH_SIZE, ...params },
    timeout: REQUEST_TIMEOUT_MS,
  });

  return fallback.data;
};

export const listeningService = {
  getProblems: async (params?: { targetLanguage?: string; difficulty?: string }) => ({
    data: await fetchPracticeProblems(params),
  }),

  answerProblem: (id: string, answer: string) =>
    api.post<ApiResponse<{ correct: boolean; correctAnswer: string; heartsRemaining: number; xpEarned: number }>>(`/listening/${id}/answer`, { answer }),
};
