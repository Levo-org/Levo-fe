import api from './api';
import type { ApiResponse, HomeData } from '../types';

export const homeService = {
  getHomeData: (params?: { targetLanguage?: string; level?: string }) =>
    api.get<ApiResponse<HomeData>>('/home', { params }),
};
