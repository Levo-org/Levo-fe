import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

declare const process: any;
const API_URL = process?.EXPO_PUBLIC_API_URL || process?.env?.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: any) => {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const tokens = useAuthStore.getState().tokens;

      if (tokens?.refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          if (data?.success) {
            const newTokens = {
              ...tokens,
              accessToken: data.data.accessToken,
            };
            useAuthStore.getState().setAuthenticated(
              useAuthStore.getState().user!,
              newTokens,
              useAuthStore.getState().languageProfile!
            );
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (e) {
          useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
