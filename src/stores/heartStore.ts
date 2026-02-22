import { create } from 'zustand';

interface HeartState {
  currentHearts: number;
  maxHearts: number;
  timeUntilNextRefill: string | null;
  isPremium: boolean;
  setHearts: (current: number, timeUntilRefill: string | null) => void;
  useHeart: () => boolean;
  refillAll: () => void;
}

export const useHeartStore = create<HeartState>((set: any, get: any) => ({
  currentHearts: 5,
  maxHearts: 5,
  timeUntilNextRefill: null,
  isPremium: false,
  setHearts: (current: number, timeUntilRefill: string | null) =>
    set({ currentHearts: current, timeUntilNextRefill: timeUntilRefill }),
  useHeart: () => {
    const { currentHearts, isPremium } = get();
    if (isPremium) return true;
    if (currentHearts <= 0) return false;
    set({ currentHearts: currentHearts - 1 });
    return true;
  },
  refillAll: () => set({ currentHearts: 5, timeUntilNextRefill: null }),
}));
