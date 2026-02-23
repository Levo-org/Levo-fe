import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { grammarService } from '../../services/grammar.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarQuiz'>;

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex?: number;
}

interface QuizData {
  topicTitle: string;
  questions: QuizQuestion[];
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function GrammarQuizScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [serverResult, setServerResult] = useState<{ correct: boolean; correctAnswer: number; explanation: string } | null>(null);

  const fetcher = useCallback(() => grammarService.getQuiz(topicId), [topicId]);
  const { data, loading } = useApi<QuizData>(fetcher);

  const questions = data?.questions ?? [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];

  const handleSelect = useCallback(async (index: number) => {
    if (answered || !currentQ) return;
    setSelectedAnswer(index);
    setAnswered(true);

    try {
      const res = await grammarService.answerQuiz(topicId, currentIndex, index);
      const result = res.data?.data;
      if (result) {
        setServerResult(result);
        if (result.correct) setCorrectCount((c) => c + 1);
      } else {
        // Fallback: client-side check
        if (currentQ.correctIndex !== undefined && index === currentQ.correctIndex) {
          setCorrectCount((c) => c + 1);
        }
      }
    } catch {
      // Fallback
      if (currentQ.correctIndex !== undefined && index === currentQ.correctIndex) {
        setCorrectCount((c) => c + 1);
      }
    }
  }, [answered, currentQ, topicId, currentIndex]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setServerResult(null);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    const correctIdx = serverResult?.correctAnswer ?? currentQ?.correctIndex;
    if (index === correctIdx) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!currentQ) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
        <Text style={{ ...typography.body, color: colors.text.secondary }}>퀴즈가 없습니다</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
          <Text style={{ ...typography.button, color: colors.primary.main }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

        {answered && serverResult?.explanation && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.explanationBox}>
            <Feather
              name={serverResult.correct ? 'check-circle' : 'info'}
              size={18}
              color={serverResult.correct ? colors.primary.main : colors.accent.blue}
            />
            <Text style={styles.explanationText}>{serverResult.explanation}</Text>
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
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  progressWrapper: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  counter: { ...typography.small, color: colors.text.secondary, marginBottom: 8 },
  question: { ...typography.h2, color: colors.text.primary, marginBottom: 32 },
  options: { gap: 12 },
  explanationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EDF7FF', borderRadius: 12, padding: 16, marginTop: 24 },
  explanationText: { ...typography.body, color: colors.text.primary, flex: 1, lineHeight: 22 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  nextButton: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { ...typography.button, color: '#FFFFFF' },
});
