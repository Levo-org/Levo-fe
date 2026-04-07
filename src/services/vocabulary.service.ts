import api from './api';
import type { ApiResponse, Word, FlashcardWord } from '../types';
import { useAuthStore } from '../stores/authStore';

interface VocabularyResponse {
  words: Word[];
  tabs: { all: number; learning: number; completed: number; wrong: number };
}

interface VocabularyUserStatus {
  status?: Word['status'];
  correctCount?: number;
  wrongCount?: number;
}

interface VocabularyApiWord extends Partial<Word> {
  _id: string;
  userStatus?: VocabularyUserStatus;
}

interface VocabularyParams {
  status?: string;
  chapter?: number;
  page?: number;
  limit?: number;
  targetLanguage?: string;
  level?: string;
}

interface FlashcardResponse {
  cards?: FlashcardWord[];
  flashcards?: FlashcardWord[];
  total?: number;
}

interface FlashcardParams {
  targetLanguage?: string;
  level?: string;
  chapter?: number;
  wordIds?: string[];
}

const resolveUserFilters = (params?: { targetLanguage?: string; level?: string }) => {
  const { user, languageProfile } = useAuthStore.getState();

  const targetLanguage = params?.targetLanguage ?? user?.activeLanguage ?? languageProfile?.targetLanguage;
  const level = params?.level ?? languageProfile?.level;

  return { targetLanguage, level };
};

const toWord = (item: VocabularyApiWord): Word => {
  const status = item.userStatus?.status ?? item.status ?? 'new';
  const correctCount = item.correctCount ?? item.userStatus?.correctCount ?? 0;
  const wrongCount = item.wrongCount ?? item.userStatus?.wrongCount ?? 0;

  return {
    _id: item._id,
    word: item.word ?? '',
    pronunciation: item.pronunciation ?? '',
    meaning: item.meaning ?? '',
    meanings: item.meanings,
    partOfSpeech: item.partOfSpeech ?? '',
    level: item.level ?? 'beginner',
    chapter: item.chapter ?? 0,
    status,
    correctCount,
    wrongCount,
  };
};

const buildTabs = (words: Word[]) => {
  const wrong = words.filter((word) => word.status === 'wrong').length;
  const learningOnly = words.filter((word) => word.status === 'learning').length;

  return {
    all: words.length,
    learning: learningOnly + wrong,
    completed: words.filter((word) => word.status === 'completed').length,
    wrong,
  };
};

const applyClientFilters = (words: Word[], params?: VocabularyParams): Word[] => {
  if (!params) return words;

  let filtered = words;

  if (params.status && params.status !== 'all') {
    if (params.status === 'learning') {
      filtered = filtered.filter((word) => word.status === 'learning' || word.status === 'wrong');
    } else {
      filtered = filtered.filter((word) => word.status === params.status);
    }
  }

  if (typeof params.chapter === 'number') {
    filtered = filtered.filter((word) => word.chapter === params.chapter);
  }

  return filtered;
};

const toFlashcard = (card: FlashcardWord): FlashcardWord => ({
  _id: card._id,
  word: card.word ?? '',
  pronunciation: card.pronunciation ?? '',
  meaning: card.meaning ?? '',
  meanings: card.meanings,
  partOfSpeech: card.partOfSpeech ?? '',
  exampleSentence: card.exampleSentence ?? '',
  exampleTranslation: card.exampleTranslation ?? '',
  audioUrl: card.audioUrl,
});

const mapServerTabs = (tabs: VocabularyResponse['tabs'] | undefined) => {
  if (!tabs) return undefined;

  return {
    ...tabs,
    learning: tabs.learning + tabs.wrong,
  };
};

export const vocabularyService = {
  getWords: async (params?: VocabularyParams) => {
    const { targetLanguage, level } = resolveUserFilters(params);
    const queryParams = {
      ...params,
      targetLanguage,
      level,
    };

    const response = await api.get<ApiResponse<VocabularyResponse | VocabularyApiWord[]>>('/vocabulary', {
      params: queryParams,
    });

    const payload = response.data.data;

    if (Array.isArray(payload)) {
      const normalizedWords = payload.map(toWord);
      return {
        data: {
          ...response.data,
          data: {
            words: applyClientFilters(normalizedWords, params),
            tabs: buildTabs(normalizedWords),
          },
        },
      };
    }

    const normalizedWords = payload.words.map(toWord);

    return {
      data: {
        ...response.data,
        data: {
          words: applyClientFilters(normalizedWords, params),
          tabs: mapServerTabs(payload.tabs) ?? buildTabs(normalizedWords),
        },
      },
    };
  },

  getFlashcards: async (count = 30, params?: FlashcardParams) => {
    const { targetLanguage, level } = resolveUserFilters(params);
    const response = await api.get<ApiResponse<FlashcardResponse | FlashcardWord[]>>('/vocabulary/flashcards', {
      params: {
        count,
        limit: count,
        targetLanguage,
        level,
        chapter: params?.chapter,
        wordIds: params?.wordIds?.length ? params.wordIds.join(',') : undefined,
        includeWrong: !(params?.wordIds && params.wordIds.length > 0),
      },
    });

    const payload = response.data.data;
    const requestedWordIds = new Set(params?.wordIds ?? []);
    const sourceCards = Array.isArray(payload)
      ? payload
      : payload.cards ?? payload.flashcards ?? [];
    const filteredSourceCards = requestedWordIds.size > 0
      ? sourceCards.filter((card) => requestedWordIds.has(card._id))
      : sourceCards;
    const cards = filteredSourceCards.map(toFlashcard).slice(0, count);
    const total = Array.isArray(payload)
      ? (requestedWordIds.size > 0 ? cards.length : payload.length)
      : (requestedWordIds.size > 0 ? cards.length : payload.total ?? cards.length);

    return {
      data: {
        ...response.data,
        data: {
          cards,
          total,
        },
      },
    };
  },

  answerFlashcard: (id: string, correct: boolean) =>
    api.post<ApiResponse<{ wordId: string; status: string; correctCount: number; wrongCount: number; xpEarned: number }>>(
      `/vocabulary/${id}/answer`,
      { wordId: id, correct },
      {
        params: (() => {
          const { targetLanguage } = resolveUserFilters();
          return targetLanguage ? { targetLanguage } : undefined;
        })(),
      },
    ),

  submitFlashcardAnswers: (answers: Array<{ wordId: string; correct: boolean }>) =>
    api.post<ApiResponse<{ processed: number; correctCount: number }>>(
      '/vocabulary/flashcards/answers',
      { answers },
      {
        params: (() => {
          const { targetLanguage } = resolveUserFilters();
          return targetLanguage ? { targetLanguage } : undefined;
        })(),
      },
    ),
};
