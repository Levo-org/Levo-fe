import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User, LanguageProfile, AuthTokens } from '../types';

const TOKEN_KEY = 'levo_tokens';
const USER_KEY = 'levo_user';
const PROFILE_KEY = 'levo_profile';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  languageProfile: LanguageProfile | null;
  tokens: AuthTokens | null;
  setAuthenticated: (user: User, tokens: AuthTokens, languageProfile?: LanguageProfile | null) => Promise<void>;
  setUser: (user: User) => void;
  setLanguageProfile: (profile: LanguageProfile) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  languageProfile: null,
  tokens: null,

  setAuthenticated: async (user, tokens, languageProfile = null) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      if (languageProfile) {
        await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(languageProfile));
      }
    } catch (e) {
      console.warn('[AuthStore] Failed to persist session:', e);
    }
    set({ isAuthenticated: true, user, tokens, languageProfile, isLoading: false });
  },

  setUser: (user) => set({ user }),
  setLanguageProfile: (languageProfile) => set({ languageProfile }),

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      await SecureStore.deleteItemAsync(PROFILE_KEY);
    } catch (e) {
      console.warn('[AuthStore] Failed to clear session:', e);
    }
    set({ isAuthenticated: false, user: null, tokens: null, languageProfile: null });
  },

  restoreSession: async () => {
    try {
      const tokensJson = await SecureStore.getItemAsync(TOKEN_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      const profileJson = await SecureStore.getItemAsync(PROFILE_KEY);

      if (tokensJson && userJson) {
        const tokens: AuthTokens = JSON.parse(tokensJson);
        const user: User = JSON.parse(userJson);
        const languageProfile: LanguageProfile | null = profileJson ? JSON.parse(profileJson) : null;
        set({ isAuthenticated: true, user, tokens, languageProfile, isLoading: false });
        return true;
      }
    } catch (e) {
      console.warn('[AuthStore] Failed to restore session:', e);
    }
    set({ isLoading: false });
    return false;
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
