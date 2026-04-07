import api from './api';
import type { ApiResponse, User, AuthTokens, LanguageProfile } from '../types';

interface AuthUser {
  _id: string;
  email: string;
  name: string;
  profileImage?: string;
  activeLanguage: string;
  isNewUser: boolean;
}

interface AuthResponse {
  user: AuthUser;
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
  /** 개발용 로그인 — SNS 로그인 대신 사용 */
  devLogin: (email = 'test@levo.com', name = '테스트유저') =>
    api.post<ApiResponse<AuthResponse>>('/auth/dev-login', { email, name }),

  loginWithGoogle: (idToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/google', { idToken }),

  loginWithApple: (idToken: string, name?: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/apple', { idToken, name }),

  refreshToken: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string; expiresIn: number }>>('/auth/refresh', { refreshToken }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<{ user: User; languageProfile: LanguageProfile | null }>>('/users/me'),

  completeOnboarding: (data: OnboardingRequest) =>
    api.post<ApiResponse<{ user: User; languageProfile: LanguageProfile }>>('/users/me/onboarding', data),
};
