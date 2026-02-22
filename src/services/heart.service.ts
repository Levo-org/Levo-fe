import api from './api';
import type { ApiResponse } from '../types';

export const heartService = {
  getHearts: () =>
    api.get<ApiResponse<{ currentHearts: number; maxHearts: number; timeUntilNextRefill: string; timeUntilFullRefill: string; isPremium: boolean }>>('/hearts'),

  useHeart: () =>
    api.post<ApiResponse<any>>('/hearts/use'),

  refillHearts: (method: 'ad' | 'coin_single' | 'coin_full') =>
    api.post<ApiResponse<any>>('/hearts/refill', { method }),
};
