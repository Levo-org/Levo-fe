import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';

// Expo SDK 52: use Constants.expoConfig.extra or fallback
const getApiUrl = (): string => {
  const extra = (Constants.expoConfig as any)?.extra;
  if (extra?.apiUrl) return extra.apiUrl;
  // For iOS simulator, localhost works. For physical device, use LAN IP.
  return 'http://192.168.45.150r:5001/api/v1';
};

const API_URL = getApiUrl();

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
            const store = useAuthStore.getState();
            await store.setAuthenticated(store.user!, newTokens, store.languageProfile);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (e) {
          await useAuthStore.getState().logout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
