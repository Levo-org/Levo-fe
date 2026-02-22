import { create } from 'zustand';
import type { User, LanguageProfile, AuthTokens } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  languageProfile: LanguageProfile | null;
  tokens: AuthTokens | null;
  setAuthenticated: (user: User, tokens: AuthTokens, languageProfile: LanguageProfile) => void;
  setUser: (user: User) => void;
  setLanguageProfile: (profile: LanguageProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  languageProfile: null,
  tokens: null,
  setAuthenticated: (user, tokens, languageProfile) =>
    set({ isAuthenticated: true, user, tokens, languageProfile }),
  setUser: (user) => set({ user }),
  setLanguageProfile: (languageProfile) => set({ languageProfile }),
  logout: () => set({ isAuthenticated: false, user: null, tokens: null, languageProfile: null }),
}));
