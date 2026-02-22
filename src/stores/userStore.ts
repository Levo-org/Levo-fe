import { create } from 'zustand';

interface UserState {
  hearts: number;
  maxHearts: number;
  streak: number;
  coins: number;
  xp: number;
  userLevel: number;
  setHearts: (hearts: number) => void;
  setStreak: (streak: number) => void;
  setCoins: (coins: number) => void;
  setXp: (xp: number) => void;
  setUserLevel: (level: number) => void;
  decrementHeart: () => void;
}

export const useUserStore = create<UserState>((set: any) => ({
  hearts: 5,
  maxHearts: 5,
  streak: 23,
  coins: 350,
  xp: 1240,
  userLevel: 12,
  setHearts: (hearts: number) => set({ hearts }),
  setStreak: (streak: number) => set({ streak }),
  setCoins: (coins: number) => set({ coins }),
  setXp: (xp: number) => set({ xp }),
  setUserLevel: (level: number) => set({ userLevel: level }),
  decrementHeart: () => set((state: any) => ({ hearts: Math.max(0, state.hearts - 1) })),
}));
