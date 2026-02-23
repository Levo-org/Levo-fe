import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { quizService } from '../../services/quiz.service';
import { useApi } from '../../hooks/useApi';
import { useHeartStore } from '../../stores/heartStore';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizSystem'>;

interface QuizQuestion {
  _id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface DailyQuiz {
  questions: QuizQuestion[];
  completed: boolean;
}

export default function QuizSystemScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { currentHearts, useHeart } = useHeartStore();
  const { setXp, setCoins, xp, coins } = useUserStore();

  const fetcher = useCallback(() => quizService.getDailyQuiz(), []);
  const { data, loading } = useApi<DailyQuiz>(fetcher);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [serverExplanation, setServerExplanation] = useState<string | null>(null);
  const [startTime] = useState(Date.now());

  const questions = data?.questions ?? [];
  const current = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleSelect = async (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    try {
      const res = await quizService.answerQuestion({
        questionId: current._id,
        selectedAnswer: index,
      });
      if (res.data?.success) {
        const d = res.data.data;
        setIsCorrect(d.correct);
        setServerExplanation(d.explanation ?? null);
        if (d.correct) setCorrectCount(c => c + 1);
        else useHeart();
        return;
      }
    } catch { /* fallback to client */ }

    const correct = index === current.correctAnswer;
    setIsCorrect(correct);
    if (correct) setCorrectCount(c => c + 1);
    else useHeart();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setServerExplanation(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const finalCorrect = correctCount + (isCorrect ? 1 : 0);
    const score = Math.round((finalCorrect / questions.length) * 100);
    try {
      const res = await quizService.completeQuiz({
        score,
        correctCount: finalCorrect,
        totalQuestions: questions.length,
      });
      if (res.data?.success) {
        const d = res.data.data;
        setXp(xp + (d.xpEarned ?? 10));
        setCoins(coins + (d.coinsEarned ?? 3));
      }
    } catch { /* ignore */ }
    setFinished(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (data?.completed) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>✅</Text>
        <Text style={styles.title}>오늘의 퀴즈 완료!</Text>
        <Text style={[styles.subtitle, { marginBottom: 32 }]}>내일 다시 도전하세요</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>퀴즈 문제가 없습니다</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const finalCorrect = correctCount;
    const score = Math.round((finalCorrect / questions.length) * 100);
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Animated.Text entering={FadeIn} style={{ fontSize: 60, marginBottom: 16 }}>
          {score >= 80 ? '🏆' : score >= 50 ? '🎉' : '💪'}
        </Animated.Text>
        <Text style={styles.title}>{score >= 80 ? '훌륭해요!' : score >= 50 ? '잘했어요!' : '좋은 시도예요!'}</Text>
        <Text style={styles.subtitle}>{questions.length}문제 중 {finalCorrect}개 정답</Text>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNum, { color: score >= 80 ? '#16A34A' : score >= 50 ? colors.primary.main : colors.status.error }]}>{score}</Text>
          <Text style={styles.scoreLabel}>점</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="x" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.heartBadge}>
          <Feather name="heart" size={16} color={colors.status.error} />
          <Text style={styles.heartCount}>{currentHearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} key={currentIndex}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{current.category ?? '일반'}</Text>
          </View>
          <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
          <Text style={styles.questionText}>{current.question}</Text>
        </Animated.View>

        <View style={styles.options}>
          {current.options.map((option, idx) => {
            let optStyle = styles.option;
            let textColor = colors.text.primary;
            if (selectedAnswer !== null) {
              if (idx === current.correctAnswer) {
                optStyle = { ...styles.option, borderColor: '#16A34A', backgroundColor: '#F0FFF4' };
                textColor = '#16A34A';
              } else if (idx === selectedAnswer && !isCorrect) {
                optStyle = { ...styles.option, borderColor: colors.status.error, backgroundColor: '#FFF5F5' };
                textColor = colors.status.error;
              }
            }
            return (
              <Animated.View entering={FadeInDown.delay(idx * 80).duration(300)} key={idx}>
                <TouchableOpacity style={optStyle} onPress={() => handleSelect(idx)} disabled={selectedAnswer !== null} activeOpacity={0.7}>
                  <View style={styles.optLabel}>
                    <Text style={[styles.optLabelText, { color: textColor }]}>{String.fromCharCode(65 + idx)}</Text>
                  </View>
                  <Text style={[styles.optText, { color: textColor }]}>{option}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {selectedAnswer !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.feedback, isCorrect ? styles.feedbackOk : styles.feedbackBad]}>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? '#16A34A' : colors.status.error }]}>
              {isCorrect ? '정답! 🎉' : '오답 😢'}
            </Text>
            {(serverExplanation || current.explanation) && (
              <Text style={styles.feedbackDesc}>{serverExplanation || current.explanation}</Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {selectedAnswer !== null && (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>{currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}</Text>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  progressBar: { flex: 1, height: 8, backgroundColor: colors.border.light, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.main, borderRadius: 4 },
  heartBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { ...typography.caption, color: colors.status.error, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  categoryText: { ...typography.small, color: colors.primary.main, fontWeight: '600' },
  questionCount: { ...typography.small, color: colors.text.secondary, marginBottom: 8 },
  questionText: { ...typography.h2, color: colors.text.primary, marginBottom: 32, lineHeight: 32 },
  options: { gap: 12 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: 'transparent', gap: 12 },
  optLabel: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' },
  optLabelText: { ...typography.caption, fontWeight: '700' },
  optText: { ...typography.body, flex: 1 },
  feedback: { marginTop: 24, borderRadius: 16, padding: 20 },
  feedbackOk: { backgroundColor: '#F0FFF4' },
  feedbackBad: { backgroundColor: '#FFF5F5' },
  feedbackTitle: { ...typography.h4, marginBottom: 8 },
  feedbackDesc: { ...typography.body, color: colors.text.secondary },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  nextBtn: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  nextBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: 24 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  scoreNum: { fontSize: 36, fontWeight: '800' },
  scoreLabel: { ...typography.small, color: colors.text.secondary },
  backBtn: { backgroundColor: colors.primary.main, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 14 },
  backBtnText: { ...typography.button, color: '#FFF' },
  emptyText: { ...typography.h3, color: colors.text.secondary, marginBottom: 16 },
});
