import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { lessonService } from '../../services/lesson.service';
import { useApi } from '../../hooks/useApi';
import { useHeartStore } from '../../stores/heartStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonQuiz'>;

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LessonDetail {
  _id: string;
  name: string;
  questions: Question[];
  xpReward: number;
}

export default function LessonQuizScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { lessonId } = route.params;
  const { currentHearts, useHeart } = useHeartStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const fetcher = useCallback(() => lessonService.getLessonDetail(lessonId), [lessonId]);
  const { data, loading } = useApi<LessonDetail>(fetcher);

  const questions = data?.questions ?? [];
  const current = questions[currentIndex];
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    const correct = index === current.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(c => c + 1);
    } else {
      useHeart();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const score = Math.round((correctCount + (isCorrect ? 0 : 0)) / questions.length * 100);
      const finalCorrect = correctCount + (isCorrect ? 0 : 0);
      navigation.replace('LessonComplete', {
        lessonId,
        score: Math.round(((isCorrect ? correctCount + 1 : correctCount) / questions.length) * 100),
        correctCount: isCorrect ? correctCount + 1 : correctCount,
        totalQuestions: questions.length,
        timeSpentSeconds: timeSpent,
      });
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>퀴즈 문제가 없습니다</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
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
        {/* Question */}
        <Animated.View entering={FadeInDown.duration(400)} key={currentIndex}>
          <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
          <Text style={styles.questionText}>{current.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {current.options.map((option, idx) => {
            let optionStyle = styles.option;
            let textColor = colors.text.primary;

            if (selectedAnswer !== null) {
              if (idx === current.correctAnswer) {
                optionStyle = { ...styles.option, ...styles.optionCorrect };
                textColor = '#16A34A';
              } else if (idx === selectedAnswer && !isCorrect) {
                optionStyle = { ...styles.option, ...styles.optionWrong };
                textColor = colors.status.error;
              }
            }

            return (
              <Animated.View entering={FadeInDown.delay(idx * 80).duration(300)} key={idx}>
                <TouchableOpacity
                  style={[optionStyle, selectedAnswer === idx && isCorrect === null && styles.optionSelected]}
                  onPress={() => handleSelect(idx)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLabel}>
                    <Text style={[styles.optionLabelText, { color: textColor }]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {selectedAnswer !== null && idx === current.correctAnswer && (
                    <Feather name="check-circle" size={20} color="#16A34A" style={{ marginLeft: 'auto' }} />
                  )}
                  {selectedAnswer !== null && idx === selectedAnswer && !isCorrect && (
                    <Feather name="x-circle" size={20} color={colors.status.error} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Feedback */}
        {selectedAnswer !== null && (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={[styles.feedbackTitle, { color: isCorrect ? '#16A34A' : colors.status.error }]}>
              {isCorrect ? '정답입니다! 🎉' : '오답입니다 😢'}
            </Text>
            {current.explanation && (
              <Text style={styles.feedbackExplanation}>{current.explanation}</Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Next Button */}
      {selectedAnswer !== null && (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {currentIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
            </Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  progressBar: { flex: 1, height: 8, backgroundColor: colors.border.light, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.main, borderRadius: 4 },
  heartBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { ...typography.caption, color: colors.status.error, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  questionCount: { ...typography.small, color: colors.text.secondary, marginBottom: 8 },
  questionText: { ...typography.h2, color: colors.text.primary, marginBottom: 32, lineHeight: 32 },
  options: { gap: 12 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: 'transparent', gap: 12 },
  optionSelected: { borderColor: colors.primary.main },
  optionCorrect: { borderColor: '#16A34A', backgroundColor: '#F0FFF4' },
  optionWrong: { borderColor: colors.status.error, backgroundColor: '#FFF5F5' },
  optionLabel: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' },
  optionLabelText: { ...typography.caption, fontWeight: '700' },
  optionText: { ...typography.body, flex: 1 },
  feedback: { marginTop: 24, borderRadius: 16, padding: 20 },
  feedbackCorrect: { backgroundColor: '#F0FFF4' },
  feedbackWrong: { backgroundColor: '#FFF5F5' },
  feedbackTitle: { ...typography.h4, marginBottom: 8 },
  feedbackExplanation: { ...typography.body, color: colors.text.secondary },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  nextButton: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  nextButtonText: { ...typography.button, color: '#FFFFFF', fontSize: 18 },
  emptyText: { ...typography.h3, color: colors.text.secondary, marginBottom: 16 },
  emptyButton: { backgroundColor: colors.primary.main, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyButtonText: { ...typography.button, color: '#FFFFFF' },
});
