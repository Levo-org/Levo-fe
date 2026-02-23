import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { reviewService } from '../../services/review.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizReview'>;

interface ReviewQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function QuizReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const fetcher = useCallback(() => reviewService.getCategoryItems('quiz'), []);
  const { data, loading } = useApi<ReviewQuestion[]>(fetcher);

  const questions = data ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const current = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setIsCorrect(idx === current.correctAnswer);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setIsCorrect(null);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try { await reviewService.completeReview('quiz'); } catch {}
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
        <Text style={styles.emptyText}>복습할 퀴즈가 없습니다</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` }]} />
        </View>
        <Text style={styles.counter}>{currentIdx + 1}/{questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} key={currentIdx}>
          <Text style={styles.question}>{current.question}</Text>
        </Animated.View>

        <View style={styles.options}>
          {current.options.map((opt, idx) => {
            let style = styles.option;
            let tColor = colors.text.primary;
            if (selected !== null) {
              if (idx === current.correctAnswer) {
                style = { ...styles.option, borderColor: '#16A34A', backgroundColor: '#F0FFF4' };
                tColor = '#16A34A';
              } else if (idx === selected && !isCorrect) {
                style = { ...styles.option, borderColor: colors.status.error, backgroundColor: '#FFF5F5' };
                tColor = colors.status.error;
              }
            }
            return (
              <Animated.View entering={FadeInDown.delay(idx * 60).duration(300)} key={idx}>
                <TouchableOpacity style={style} onPress={() => handleSelect(idx)} disabled={selected !== null} activeOpacity={0.7}>
                  <Text style={[styles.optText, { color: tColor }]}>{opt}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {selected !== null && current.explanation && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.explanation}>
            <Text style={styles.explanationText}>{current.explanation}</Text>
          </Animated.View>
        )}
      </ScrollView>

      {selected !== null && (
        <Animated.View entering={FadeIn.duration(300)} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextBtnText}>{currentIdx < questions.length - 1 ? '다음' : '완료'}</Text>
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  progressBar: { flex: 1, height: 8, backgroundColor: colors.border.light, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary.main, borderRadius: 4 },
  counter: { ...typography.caption, color: colors.text.secondary },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  question: { ...typography.h2, color: colors.text.primary, marginBottom: 32, lineHeight: 32 },
  options: { gap: 12 },
  option: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, borderWidth: 2, borderColor: 'transparent' },
  optText: { ...typography.body },
  explanation: { marginTop: 20, backgroundColor: '#FFF7ED', borderRadius: 12, padding: 16 },
  explanationText: { ...typography.small, color: '#92400E' },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  nextBtn: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  nextBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  emptyText: { ...typography.body, color: colors.text.secondary, marginBottom: 16 },
  backBtn: { backgroundColor: colors.primary.main, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { ...typography.button, color: '#FFF' },
});
