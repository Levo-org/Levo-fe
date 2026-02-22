import { create } from 'zustand';

interface OnboardingState {
  targetLanguage: string | null;
  level: string | null;
  dailyGoalMinutes: number | null;
  notificationEnabled: boolean;
  notificationHour: number;
  setTargetLanguage: (lang: string) => void;
  setLevel: (level: string) => void;
  setDailyGoal: (minutes: number) => void;
  setNotification: (enabled: boolean, hour: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set: any) => ({
  targetLanguage: null,
  level: null,
  dailyGoalMinutes: null,
  notificationEnabled: true,
  notificationHour: 7,
  setTargetLanguage: (lang: string) => set({ targetLanguage: lang }),
  setLevel: (level: string) => set({ level }),
  setDailyGoal: (minutes: number) => set({ dailyGoalMinutes: minutes }),
  setNotification: (enabled: boolean, hour: number) => set({ notificationEnabled: enabled, notificationHour: hour }),
  reset: () => set({ targetLanguage: null, level: null, dailyGoalMinutes: null, notificationEnabled: true, notificationHour: 7 }),
}));
