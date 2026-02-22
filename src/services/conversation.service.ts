import api from './api';
import type { ApiResponse, ConversationSituation } from '../types';

export const conversationService = {
  getSituations: () =>
    api.get<ApiResponse<ConversationSituation[]>>('/conversations'),

  getDetail: (id: string) =>
    api.get<ApiResponse<any>>(`/conversations/${id}`),

  submitPractice: (id: string, dialogIndex: number, pronunciationScore: number) =>
    api.post<ApiResponse<any>>(`/conversations/${id}/practice`, { dialogIndex, pronunciationScore }),
};
