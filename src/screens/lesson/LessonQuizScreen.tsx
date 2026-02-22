import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { useHeartStore } from '../../stores/heartStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonQuiz'>;

const MOCK_QUESTIONS = [
  {
    id: 1,
    question: '"안녕하세요"를 영어로 하면?',
    options: ['Goodbye', 'Thank you', 'Hello', 'Sorry'],
    correctIndex: 2,
  },
  {
    id: 2,
    question: '"감사합니다"를 영어로 하면?',
    options: ['Please', 'Thank you', 'Excuse me', 'Hello'],
    correctIndex: 1,
  },
  {
    id: 3,
    question: '"Good morning"의 뜻은?',
    options: ['좋은 밤', '좋은 아침', '안녕히 가세요', '만나서 반갑습니다'],
    correctIndex: 1,
  },
  {
    id: 4,
    question: '"Nice to meet you"의 뜻은?',
    options: ['또 만나요', '잘 지내세요?', '만나서 반갑습니다', '오랜만이에요'],
    correctIndex: 2,
  },
  {
    id: 5,
    question: '"Goodbye"를 한국어로 하면?',
    options: ['안녕하세요', '감사합니다', '미안합니다', '안녕히 가세요'],
    correctIndex: 3,
  },
];

const LABELS = ['A', 'B', 'C', 'D'];

export default function LessonQuizScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const { useHeart } = useHeartStore();

  const totalQuestions = MOCK_QUESTIONS.length;
  const currentQuestion = MOCK_QUESTIONS[currentIndex];

  const handleSelect = useCallback((index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    if (index === currentQuestion.correctIndex) {
      setCorrectCount((c) => c + 1);
    } else {
      useHeart();
    }
  }, [answered, currentQuestion, useHeart]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      navigation.replace('LessonComplete', {
        lessonId,
        score: Math.round((correctCount / totalQuestions) * 100),
        correctCount,
        totalQuestions,
      });
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return selectedAnswer === index ? 'selected' : 'default';
    if (index === currentQuestion.correctIndex) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={totalQuestions} height={6} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View key={currentIndex} entering={FadeInDown.duration(400)}>
          <Text style={styles.counter}>문제 {currentIndex + 1}/{totalQuestions}</Text>
          <Text style={styles.question}>{currentQuestion.question}</Text>

          <View style={styles.options}>
            {currentQuestion.options.map((option, idx) => (
              <QuizOption
                key={idx}
                label={LABELS[idx]}
                text={option}
                state={getOptionState(idx) as any}
                onPress={() => handleSelect(idx)}
                disabled={answered}
              />
            ))}
          </View>
        </Animated.View>

        {answered && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.feedback}>
            <Text style={[
              styles.feedbackText,
              { color: selectedAnswer === currentQuestion.correctIndex ? colors.primary.main : colors.status.error },
            ]}>
              {selectedAnswer === currentQuestion.correctIndex ? '정답입니다! 🎉' : '아쉽지만 틀렸어요 😢'}
            </Text>
          </Animated.View>
        )}
      </View>

      {answered && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {currentIndex < totalQuestions - 1 ? '다음' : '결과 보기'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  closeText: {
    fontSize: 20,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  counter: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  question: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  feedback: {
    marginTop: 24,
    alignItems: 'center',
  },
  feedbackText: {
    ...typography.h3,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
