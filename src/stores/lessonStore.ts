import { create } from 'zustand';
import type { LessonUnit } from '../types';

interface LessonState {
  units: LessonUnit[];
  currentLessonId: string | null;
  setUnits: (units: LessonUnit[]) => void;
  setCurrentLesson: (id: string | null) => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  units: [],
  currentLessonId: null,
  setUnits: (units) => set({ units }),
  setCurrentLesson: (id) => set({ currentLessonId: id }),
}));
