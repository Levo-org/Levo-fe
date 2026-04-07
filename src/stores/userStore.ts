import { create } from 'zustand';

interface UserState {
  streak: number;
  coins: number;
  xp: number;
  userLevel: number;
  setStreak: (streak: number) => void;
  setCoins: (coins: number) => void;
  setXp: (xp: number) => void;
  setUserLevel: (level: number) => void;
}

export const useUserStore = create<UserState>((set: any) => ({
  streak: 23,
  coins: 0,
  xp: 1240,
  userLevel: 12,
  setStreak: (streak: number) => set({ streak }),
  setCoins: (coins: number) => set({ coins }),
  setXp: (xp: number) => set({ xp }),
  setUserLevel: (level: number) => set({ userLevel: level }),
}));
