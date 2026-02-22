import api from './api';
import type { ApiResponse, ReviewCategory } from '../types';

export const reviewService = {
  getDashboard: () =>
    api.get<ApiResponse<{ totalReviewItems: number; categories: ReviewCategory[] }>>('/review'),

  getCategoryItems: (category: string) =>
    api.get<ApiResponse<any>>(`/review/${category}`),

  completeReview: (category: string) =>
    api.post<ApiResponse<any>>(`/review/${category}/complete`),
};
