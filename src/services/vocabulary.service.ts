import api from './api';
import type { ApiResponse, Word, FlashcardWord } from '../types';

interface VocabularyResponse {
  words: Word[];
  tabs: { all: number; learning: number; completed: number; wrong: number };
}

export const vocabularyService = {
  getWords: (params?: { status?: string; chapter?: number; page?: number; limit?: number }) =>
    api.get<ApiResponse<VocabularyResponse>>('/vocabulary', { params }),

  getFlashcards: (count?: number) =>
    api.get<ApiResponse<{ cards: FlashcardWord[]; total: number }>>('/vocabulary/flashcards', { params: { count } }),

  answerFlashcard: (id: string, correct: boolean) =>
    api.post<ApiResponse<{ wordId: string; status: string; correctCount: number; wrongCount: number; xpEarned: number }>>(`/vocabulary/${id}/answer`, { correct }),
};
