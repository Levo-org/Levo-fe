import api from './api';
import type { ApiResponse, User, AuthTokens, LanguageProfile } from '../types';

interface AuthResponse {
  user: User & { isNewUser: boolean };
  tokens: AuthTokens;
}

interface OnboardingRequest {
  targetLanguage: string;
  level: string;
  dailyGoalMinutes: number;
  notificationEnabled: boolean;
  notificationHour: number;
}

export const authService = {
  loginWithGoogle: (idToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/google', { idToken }),

  loginWithApple: (idToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/apple', { idToken }),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  completeOnboarding: (data: OnboardingRequest) =>
    api.post<ApiResponse<{ user: User; languageProfile: LanguageProfile }>>('/users/me/onboarding', data),
};
