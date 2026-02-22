# Levo Frontend - TODO

## 📋 작업 현황

### Phase 1: 프로젝트 초기 설정
- [x] README.md 작성
- [x] TODO.md 작성
- [x] Expo 프로젝트 초기화 (package.json, tsconfig, app.json, babel.config)
- [x] 의존성 설치 (React Navigation, Zustand, Axios, Reanimated 등)
- [x] 디자인 시스템 설정 (colors, typography, spacing)
- [x] 네비게이션 구조 설정 (AuthStack, MainTab, RootNavigator)
- [x] 타입 정의 (navigation types, API types)

### Phase 2: 공통 컴포넌트
- [x] TopBar 컴포넌트 (full/simple variant, 하트/스트릭/코인 표시)
- [x] ProgressIndicator 컴포넌트 (온보딩 단계 표시)
- [x] HeartsModal 컴포넌트 (하트 충전 모달)

### Phase 3: 인증/온보딩 화면 (6개)
- [x] Splash 화면 (앱 로고 + 로딩 애니메이션)
- [x] Welcome 화면 (소개 + Google/Apple 로그인)
- [x] LanguageSelect 화면 (영어/일본어/중국어 선택)
- [x] LevelSelect 화면 (입문/초급/중급/고급 선택)
- [x] GoalSetting 화면 (일일 학습 목표 설정)
- [x] NotificationSetup 화면 (알림 시간 설정)

### Phase 4: 메인 탭 화면 (5개)
- [x] Home 화면 (인사, 진행률, 스트릭, 카테고리)
- [x] LessonMap 화면 (레슨 맵 + 진행 상태)
- [x] Review 화면 (복습 대시보드)
- [x] Stats 화면 (통계 + 차트)
- [x] Profile 화면 (프로필 + 뱃지 + 코인)

### Phase 5: 학습 화면
- [x] Vocabulary 화면 (단어 목록 + 탭 필터)
- [x] Flashcard 화면 (플래시카드 학습)
- [x] FlashcardComplete 화면 (학습 결과)
- [x] Grammar 화면 (문법 목록)
- [x] GrammarDetail 화면 (문법 상세)
- [x] GrammarQuiz 화면 (문법 퀴즈)
- [x] Conversation 화면 (회화 상황 목록)
- [x] ConversationDialog 화면 (대화문)
- [x] ConversationPractice 화면 (발음 연습)
- [x] ListeningPractice 화면 (듣기 연습)
- [x] ReadingPractice 화면 (읽기 연습)

### Phase 6: 퀴즈/레슨 완료 화면
- [x] LessonStart 화면 (레슨 시작 미리보기)
- [x] LessonQuiz 화면 (레슨 퀴즈)
- [x] LessonComplete 화면 (레슨 완료 결과)
- [x] QuizSystem 화면 (종합 퀴즈)

### Phase 7: 복습 화면 (6개)
- [x] VocabularyReview 화면
- [x] GrammarReview 화면
- [x] ConversationReview 화면
- [x] ListeningReview 화면
- [x] ReadingReview 화면
- [x] QuizReview 화면 (오답 노트)

### Phase 8: 기타 화면
- [x] Settings 화면 (설정)
- [x] Badges 화면 (뱃지 컬렉션)
- [x] CoinShop 화면 (코인 상점)
- [x] CoinShopUse 화면 (코인 사용처)
- [x] Premium 화면 (프리미엄 구독)
- [x] StreakDetail 화면 (스트릭 상세)
- [x] HeartsDemo 화면 (하트 시스템)

### Phase 9: API 연동/상태관리
- [x] Axios 인스턴스 설정 (인터셉터, 토큰 관리)
- [x] API 서비스 레이어 (auth, user, vocabulary, grammar 등)
- [x] Zustand 스토어 (authStore, userStore, onboardingStore 등)

### Phase 10: 앱 엔트리포인트
- [x] App.tsx (GestureHandler, SafeAreaProvider, StatusBar, RootNavigator)
- [x] 네비게이션 import 수정 (default exports 대응)

---

## 📊 진행률: **완료!** ✅

총 화면: 37개 / 구현: 37개
총 공통 컴포넌트: 5개 / 구현: 5개 (TopBar, ProgressIndicator, HeartsModal, BackButton, QuizOption)
API 서비스: 18개 + api.ts / 구현: 19개
상태 스토어: 5개 / 구현: 5개
엔트리포인트: App.tsx ✅
