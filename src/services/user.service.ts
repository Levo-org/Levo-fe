import api from './api';
import type { ApiResponse, User, LanguageProfile, UserSettings } from '../types';

export const userService = {
  getMe: () =>
    api.get<ApiResponse<{ user: User; languageProfile: LanguageProfile }>>('/users/me'),

  updateProfile: (data: Partial<Pick<User, 'name' | 'profileImage'>>) =>
    api.patch<ApiResponse<User>>('/users/me', data),

  updateSettings: (data: Partial<UserSettings>) =>
    api.patch<ApiResponse<UserSettings>>('/users/me/settings', data),

  changeLanguage: (targetLanguage: string) =>
    api.patch<ApiResponse<{ activeLanguage: string; languageProfile: LanguageProfile; isNew: boolean }>>('/users/me/language', { targetLanguage }),
};
