import api from './api';
import type { ApiResponse, ConversationSituation, ConversationDetail } from '../types';

const PAGE_SIZE = 100;

const fetchAllSituations = async (params?: { targetLanguage?: string; level?: string }): Promise<ApiResponse<ConversationSituation[]>> => {
  const items: ConversationSituation[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await api.get<ApiResponse<ConversationSituation[]>>('/conversations', {
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

export const conversationService = {
  getSituations: async (params?: { targetLanguage?: string; level?: string }) => ({
    data: await fetchAllSituations(params),
  }),

  getDetail: (id: string) =>
    api.get<ApiResponse<ConversationDetail>>(`/conversations/${id}`),

  submitPractice: (id: string, pronunciationScore: number) =>
    api.post<ApiResponse<{ pronunciationScore: number }>>(`/conversations/${id}/practice`, {
      pronunciationScore,
      correct: pronunciationScore >= 70,
    }),
};
