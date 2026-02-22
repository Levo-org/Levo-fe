// Navigation Types
export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  LanguageSelect: undefined;
  LevelSelect: undefined;
  GoalSetting: undefined;
  NotificationSetup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  LearnTab: undefined;
  ReviewTab: undefined;
  StatsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  // Vocabulary
  Vocabulary: Record<string, any> | undefined;
  Flashcard: Record<string, any>;
  FlashcardComplete: Record<string, any>;
  // Grammar
  Grammar: Record<string, any> | undefined;
  GrammarDetail: Record<string, any>;
  GrammarQuiz: Record<string, any>;
  // Conversation
  Conversation: Record<string, any> | undefined;
  ConversationDialog: Record<string, any>;
  ConversationPractice: Record<string, any>;
  // Listening & Reading
  ListeningPractice: Record<string, any> | undefined;
  ReadingPractice: Record<string, any> | undefined;
  // Lesson
  LessonMap: Record<string, any> | undefined;
  LessonStart: Record<string, any>;
  LessonQuiz: Record<string, any>;
  LessonComplete: Record<string, any>;
  // Quiz
  QuizSystem: Record<string, any> | undefined;
  // Review
  Review: Record<string, any> | undefined;
  VocabularyReview: Record<string, any> | undefined;
  GrammarReview: Record<string, any> | undefined;
  ConversationReview: Record<string, any> | undefined;
  ListeningReview: Record<string, any> | undefined;
  ReadingReview: Record<string, any> | undefined;
  QuizReview: Record<string, any> | undefined;
  // Others
  StreakDetail: Record<string, any> | undefined;
  Badges: Record<string, any> | undefined;
  CoinShop: Record<string, any> | undefined;
  CoinShopUse: Record<string, any> | undefined;
  Premium: Record<string, any> | undefined;
  Settings: Record<string, any> | undefined;
  HeartsDemo: Record<string, any> | undefined;
};

// API Types
export interface User {
  _id: string;
  email: string;
  name: string;
  profileImage?: string;
  activeLanguage: string;
  isPremium: boolean;
  coins: number;
  settings: UserSettings;
}

export interface UserSettings {
  dailyGoalMinutes: number;
  notificationEnabled: boolean;
  notificationHour: number;
  soundEnabled: boolean;
  effectsEnabled: boolean;
}

export interface LanguageProfile {
  targetLanguage: string;
  level: string;
  xp: number;
  userLevel: number;
  hearts: number;
  vocabularyProgress: number;
  grammarProgress: number;
  conversationProgress: number;
  listeningProgress: number;
  readingProgress: number;
  quizProgress: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Word {
  _id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  partOfSpeech: string;
  level: string;
  chapter: number;
  status: 'completed' | 'learning' | 'new' | 'wrong';
  correctCount: number;
  wrongCount: number;
}

export interface FlashcardWord {
  _id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleTranslation: string;
  audioUrl?: string;
}

export interface GrammarTopic {
  _id: string;
  icon: string;
  title: string;
  subtitle: string;
  level: string;
  progress: number;
  status: 'completed' | 'learning' | 'locked';
  locked: boolean;
}

export interface ConversationSituation {
  _id: string;
  emoji: string;
  title: string;
  level: string;
  completed: boolean;
  locked: boolean;
}

export interface LessonUnit {
  unitNumber: number;
  unitTitle: string;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  name: string;
  status: 'completed' | 'current' | 'locked';
}

export interface Badge {
  _id: string;
  emoji: string;
  name: string;
  category: string;
  achieved: boolean;
  achievedAt?: string;
  condition?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  weeklyRecord: WeekDay[];
  streakShields: number;
  nextMilestone: { target: number; remaining: number };
  isInDanger: boolean;
  hoursUntilReset: number;
}

export interface WeekDay {
  date: string;
  day: string;
  completed: boolean;
  minutes: number;
}

export interface HomeData {
  greeting: string;
  hearts: { current: number; max: number; timeUntilRefill: string | null };
  todayLesson: { progress: number; completed: number; total: number; nextLessonId?: string };
  streak: { current: number; isInDanger: boolean; weeklyRecord: WeekDay[] };
  categories: { id: string; label: string; progress: number }[];
  state: 'normal' | 'low-hearts' | 'streak-danger';
}

export interface ReviewCategory {
  id: string;
  name: string;
  emoji: string;
  count: number;
  lastReview: string;
  nextReview: string;
  priority: 'urgent' | 'recommended' | 'normal';
  accuracy: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
