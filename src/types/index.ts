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
  ReviewTab: undefined;
  StatsTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  // Vocabulary
  Vocabulary: undefined;
  Flashcard: { chapter?: number; wordIds?: string[] } | undefined;
  FlashcardComplete: { totalCards: number; knownCards: number; wrongWordIds: string[]; chapter?: number };
  // Grammar
  Grammar: Record<string, any> | undefined;
  GrammarDetail: Record<string, any>;
  GrammarQuiz: Record<string, any>;
  // Conversation
  Conversation: Record<string, any> | undefined;
  ConversationDialog: { situationId: string };
  ConversationPractice: { situationId: string };
  // Listening & Reading
  ListeningPractice: { problemId?: string } | undefined;
  ReadingPractice: { passageId?: string } | undefined;
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
  Profile: Record<string, any> | undefined;
  Stats: Record<string, any> | undefined;
  StreakDetail: Record<string, any> | undefined;
  Badges: Record<string, any> | undefined;
  CoinShop: Record<string, any> | undefined;
  CoinShopUse: Record<string, any> | undefined;
  Premium: Record<string, any> | undefined;
  Settings: Record<string, any> | undefined;
  SourcesCredits: undefined;
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
  expiresIn?: number;
}

export interface Word {
  _id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  meanings?: string[];
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
  meanings?: string[];
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

export interface ReadingPracticeQuestion {
  question: string;
  options: string[];
  correctIndex?: number;
}

export interface ReadingPracticePassage {
  _id: string;
  title: string;
  text: string;
  translation: string;
  difficulty: string;
  questions: ReadingPracticeQuestion[];
}

export interface ListeningPracticeItem {
  _id: string;
  question: string;
  options: string[];
  ttsText: string;
  difficulty: string;
  audioUrl: null;
}

export interface ConversationDialogLine {
  speaker: string;
  text: string;
  translation: string;
  isUserRole: boolean;
  isUser: boolean;
}

export interface ConversationDetail {
  _id: string;
  emoji: string;
  title: string;
  level?: string;
  description: string;
  dialogs: ConversationDialogLine[];
  dialog: ConversationDialogLine[];
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
  icon?: string;
  name: string;
  description: string;
  category: string;
  achieved: boolean;
  earned?: boolean;
  achievedAt?: string;
  earnedAt?: string;
  condition?: {
    type: string;
    value: number;
  };
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  weeklyRecord: WeekDay[];
  weekDays: WeekDay[];
  streakShields: number;
  shieldsRemaining: number;
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
  user?: {
    name: string;
    profileImage?: string;
    coins: number;
    isPremium: boolean;
    settings?: { dailyGoalMinutes: number };
  };
  profile?: {
    level: string;
    userLevel: number;
    xp: number;
    hearts: number;
    vocabularyProgress: number;
    grammarProgress: number;
    conversationProgress: number;
    listeningProgress: number;
    readingProgress: number;
  } | null;
  hearts?: { current: number; max: number; timeUntilRefill: string | null };
  todayLesson: { progress: number; completed: number; total: number; nextLessonId?: string };
  todaySummary?: { studied: boolean; completedLessons: number; learnedWords: number };
  streak: { current: number; isInDanger: boolean; weeklyRecord?: WeekDay[]; currentStreak?: number; longestStreak?: number; todayCompleted?: boolean };
  categories: { id: string; label: string; progress: number; completed?: number; total?: number }[];
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
