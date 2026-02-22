import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../stores/authStore';
import { AuthStack } from './AuthStack';
import { MainTab } from './MainTab';

// Screens
import VocabularyScreen from '../screens/vocabulary/VocabularyScreen';
import FlashcardScreen from '../screens/vocabulary/FlashcardScreen';
import FlashcardCompleteScreen from '../screens/vocabulary/FlashcardCompleteScreen';
import GrammarScreen from '../screens/grammar/GrammarScreen';
import GrammarDetailScreen from '../screens/grammar/GrammarDetailScreen';
import GrammarQuizScreen from '../screens/grammar/GrammarQuizScreen';
import ConversationScreen from '../screens/conversation/ConversationScreen';
import ConversationDialogScreen from '../screens/conversation/ConversationDialogScreen';
import ConversationPracticeScreen from '../screens/conversation/ConversationPracticeScreen';
import ListeningPracticeScreen from '../screens/listening/ListeningPracticeScreen';
import ReadingPracticeScreen from '../screens/reading/ReadingPracticeScreen';
import LessonMapScreen from '../screens/home/LessonMapScreen';
import LessonStartScreen from '../screens/lesson/LessonStartScreen';
import LessonQuizScreen from '../screens/lesson/LessonQuizScreen';
import LessonCompleteScreen from '../screens/lesson/LessonCompleteScreen';
import QuizSystemScreen from '../screens/quiz/QuizSystemScreen';
import VocabularyReviewScreen from '../screens/review/VocabularyReviewScreen';
import GrammarReviewScreen from '../screens/review/GrammarReviewScreen';
import ConversationReviewScreen from '../screens/review/ConversationReviewScreen';
import ListeningReviewScreen from '../screens/review/ListeningReviewScreen';
import ReadingReviewScreen from '../screens/review/ReadingReviewScreen';
import QuizReviewScreen from '../screens/review/QuizReviewScreen';
import StreakDetailScreen from '../screens/stats/StreakDetailScreen';
import BadgesScreen from '../screens/stats/BadgesScreen';
import CoinShopScreen from '../screens/shop/CoinShopScreen';
import CoinShopUseScreen from '../screens/shop/CoinShopUseScreen';
import PremiumScreen from '../screens/shop/PremiumScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HeartsDemoScreen from '../screens/profile/HeartsDemoScreen';

const Stack: any = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTab} />
            <Stack.Screen name="Vocabulary" component={VocabularyScreen} />
            <Stack.Screen name="Flashcard" component={FlashcardScreen} />
            <Stack.Screen name="FlashcardComplete" component={FlashcardCompleteScreen} />
            <Stack.Screen name="Grammar" component={GrammarScreen} />
            <Stack.Screen name="GrammarDetail" component={GrammarDetailScreen} />
            <Stack.Screen name="GrammarQuiz" component={GrammarQuizScreen} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
            <Stack.Screen name="ConversationDialog" component={ConversationDialogScreen} />
            <Stack.Screen name="ConversationPractice" component={ConversationPracticeScreen} />
            <Stack.Screen name="ListeningPractice" component={ListeningPracticeScreen} />
            <Stack.Screen name="ReadingPractice" component={ReadingPracticeScreen} />
            <Stack.Screen name="LessonMap" component={LessonMapScreen} />
            <Stack.Screen name="LessonStart" component={LessonStartScreen} />
            <Stack.Screen name="LessonQuiz" component={LessonQuizScreen} />
            <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
            <Stack.Screen name="QuizSystem" component={QuizSystemScreen} />
            <Stack.Screen name="Review" component={VocabularyReviewScreen} />
            <Stack.Screen name="VocabularyReview" component={VocabularyReviewScreen} />
            <Stack.Screen name="GrammarReview" component={GrammarReviewScreen} />
            <Stack.Screen name="ConversationReview" component={ConversationReviewScreen} />
            <Stack.Screen name="ListeningReview" component={ListeningReviewScreen} />
            <Stack.Screen name="ReadingReview" component={ReadingReviewScreen} />
            <Stack.Screen name="QuizReview" component={QuizReviewScreen} />
            <Stack.Screen name="StreakDetail" component={StreakDetailScreen} />
            <Stack.Screen name="Badges" component={BadgesScreen} />
            <Stack.Screen name="CoinShop" component={CoinShopScreen} />
            <Stack.Screen name="CoinShopUse" component={CoinShopUseScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="HeartsDemo" component={HeartsDemoScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
