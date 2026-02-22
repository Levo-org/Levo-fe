import api from './api';
import type { ApiResponse, HomeData } from '../types';

export const homeService = {
  getHomeData: () =>
    api.get<ApiResponse<HomeData>>('/home'),
};
