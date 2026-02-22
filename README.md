# Levo - 언어 학습 앱 (React Native)

> **Levo** = Elevate + Vocab — 언어로 나를 끌어올리다 🚀

Levo는 듀오링고 스타일의 게이미피케이션 기반 언어 학습 앱입니다.
영어, 일본어, 중국어 학습을 지원하며, iOS/Android 모두 배포 가능합니다.

---

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **Framework** | React Native (Expo SDK 52) |
| **Language** | TypeScript |
| **Navigation** | React Navigation v7 (Stack + Bottom Tab) |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Styling** | StyleSheet (React Native) |
| **Animation** | React Native Reanimated 3 |
| **Icons** | @expo/vector-icons (Feather) |
| **Auth** | expo-auth-session (Google/Apple OAuth) |
| **Storage** | expo-secure-store (토큰), @react-native-async-storage (설정) |
| **Notifications** | expo-notifications |

---

## 📁 프로젝트 구조

```
Levo-fe/
├── App.tsx                     # 앱 진입점
├── app.json                    # Expo 설정
├── package.json
├── tsconfig.json
├── babel.config.js
├── assets/                     # 이미지, 폰트 등
├── src/
│   ├── navigation/             # 네비게이션 설정
│   │   ├── index.tsx           # 루트 네비게이터
│   │   ├── AuthStack.tsx       # 인증 스택
│   │   ├── MainTab.tsx         # 메인 탭 네비게이터
│   │   └── types.ts            # 네비게이션 타입
│   ├── screens/                # 화면 컴포넌트 (37개)
│   │   ├── auth/               # 온보딩/인증
│   │   ├── home/               # 홈/레슨맵
│   │   ├── vocabulary/         # 단어장/플래시카드
│   │   ├── grammar/            # 문법
│   │   ├── conversation/       # 회화
│   │   ├── listening/          # 듣기
│   │   ├── reading/            # 읽기
│   │   ├── quiz/               # 퀴즈
│   │   ├── review/             # 복습
│   │   ├── stats/              # 통계/뱃지
│   │   ├── profile/            # 프로필/설정
│   │   └── shop/               # 코인샵/프리미엄
│   ├── components/             # 공통 컴포넌트
│   ├── services/               # API 서비스 레이어
│   ├── stores/                 # Zustand 상태 관리
│   ├── theme/                  # 디자인 시스템
│   ├── types/                  # TypeScript 타입
│   └── utils/                  # 유틸리티
```

---

## 🚀 시작하기

### 사전 요구사항

- Node.js 18+
- Expo CLI (`npx expo`)
- iOS: Xcode (Mac only)
- Android: Android Studio

### 설치 및 실행

```bash
cd Levo-fe
npm install
npx expo start
# iOS: i 키 / Android: a 키
```

### 환경 변수

`.env` 파일을 프로젝트 루트에 생성:

```env
EXPO_PUBLIC_API_URL=http://localhost:5001/api/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
EXPO_PUBLIC_APPLE_CLIENT_ID=your-apple-client-id
```

---

## 🎨 디자인 시스템

### 브랜드 컬러

| 이름 | 코드 | 용도 |
|------|------|------|
| Green (Primary) | `#58CC02` | 메인 버튼, 정답, 진행률 |
| Gold | `#FFC800` | 코인, 추천, 퀴즈 |
| Red | `#FF4B4B` | 하트, 오답 |
| Blue | `#1CB0F6` | 문법, 정보 |
| Purple | `#CE82FF` | 회화 |

### 화면 흐름

**온보딩**: Splash → Welcome → LanguageSelect → LevelSelect → GoalSetting → NotificationSetup → Home

**메인 탭**: 홈 | 학습 | 복습 | 통계 | 프로필

---

## 🔗 백엔드 API

- Base URL: `http://localhost:5001/api/v1`
- 인증: Bearer Token (JWT)
- 상세: `../Levo-be/API_SPEC.md`

---

## 📦 배포

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```
