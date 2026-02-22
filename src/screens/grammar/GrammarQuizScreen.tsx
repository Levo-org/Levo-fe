import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarQuiz'>;

const MOCK_QUESTIONS = [
  { id: 1, question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctIndex: 1, explanation: '3인칭 단수 주어(She)에는 동사에 -es를 붙입니다.' },
  { id: 2, question: 'They ___ playing football now.', options: ['is', 'am', 'are', 'be'], correctIndex: 2, explanation: '복수 주어(They)에는 are를 사용합니다.' },
  { id: 3, question: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], correctIndex: 0, explanation: '1인칭 단수 주어(I)에는 am을 사용합니다.' },
];

const LABELS = ['A', 'B', 'C', 'D'];

export default function GrammarQuizScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const totalQuestions = MOCK_QUESTIONS.length;
  const currentQ = MOCK_QUESTIONS[currentIndex];

  const handleSelect = useCallback((index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === currentQ.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  }, [answered, currentQ]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    if (index === currentQ.correctIndex) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={totalQuestions} height={6} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View key={currentIndex} entering={FadeInDown.duration(400)}>
          <Text style={styles.counter}>문제 {currentIndex + 1}/{totalQuestions}</Text>
          <Text style={styles.question}>{currentQ.question}</Text>

          <View style={styles.options}>
            {currentQ.options.map((option, idx) => (
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
          <Animated.View entering={FadeInUp.duration(300)} style={styles.explanationBox}>
            <Feather
              name={selectedAnswer === currentQ.correctIndex ? 'check-circle' : 'info'}
              size={18}
              color={selectedAnswer === currentQ.correctIndex ? colors.primary.main : colors.accent.blue}
            />
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
          </Animated.View>
        )}
      </View>

      {answered && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {currentIndex < totalQuestions - 1 ? '다음' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 0,
    paddingBottom: 16,
    gap: 12,
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
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EDF7FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  explanationText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 22,
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
