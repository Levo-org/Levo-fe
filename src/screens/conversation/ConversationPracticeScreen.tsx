import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { conversationService } from '../../services/conversation.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationPractice'>;

interface PracticeData {
  situation: string;
  dialogs: {
    speaker: string;
    text: string;
    translation: string;
  }[];
}

export default function ConversationPracticeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { situationId } = route.params;

  const fetcher = useCallback(() => conversationService.getDetail(situationId), [situationId]);
  const { data, loading } = useApi<PracticeData>(fetcher);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dialogs = data?.dialogs ?? [];
  const current = dialogs[currentIndex];

  const handlePractice = async () => {
    // Simulate pronunciation score (in real app, would use speech recognition)
    const score = Math.floor(Math.random() * 30) + 70; // 70-100

    setSubmitting(true);
    try {
      await conversationService.submitPractice(situationId, currentIndex, score);
    } catch { /* continue */ }
    setSubmitting(false);

    setScores(prev => [...prev, score]);

    if (currentIndex < dialogs.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (dialogs.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
        <Text style={styles.emptyText}>연습할 대화가 없습니다</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🎉</Text>
        <Text style={styles.finishTitle}>연습 완료!</Text>
        <Text style={styles.finishSubtitle}>평균 점수: {avgScore}점</Text>

        <View style={styles.scoreBreakdown}>
          {scores.map((s, idx) => (
            <View key={idx} style={styles.scoreRow}>
              <Text style={styles.scoreIdx}>#{idx + 1}</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreFill, { width: `${s}%` }]} />
              </View>
              <Text style={styles.scoreVal}>{s}점</Text>
            </View>
          ))}
        </View>

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
        <Text style={styles.headerTitle}>회화 연습</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{dialogs.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} key={currentIndex} style={styles.dialogCard}>
          <Text style={styles.speaker}>{current.speaker}</Text>
          <Text style={styles.dialogText}>{current.text}</Text>
          <View style={styles.divider} />
          <Text style={styles.translation}>{current.translation}</Text>
        </Animated.View>

        {/* Previous scores */}
        {scores.length > 0 && (
          <View style={styles.prevScores}>
            <Text style={styles.prevTitle}>이전 점수</Text>
            <View style={styles.prevRow}>
              {scores.map((s, idx) => (
                <View key={idx} style={styles.prevBadge}>
                  <Text style={styles.prevBadgeText}>{s}점</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.practiceBtn}
          onPress={handlePractice}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Feather name="mic" size={22} color="#FFF" />
          <Text style={styles.practiceBtnText}>
            {submitting ? '평가 중...' : '따라 말하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  counter: { ...typography.caption, color: colors.text.secondary },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  dialogCard: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 24, marginBottom: 20 },
  speaker: { ...typography.caption, color: colors.primary.main, fontWeight: '700', marginBottom: 8 },
  dialogText: { ...typography.h2, color: colors.text.primary, lineHeight: 32, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: 12 },
  translation: { ...typography.body, color: colors.text.secondary },
  prevScores: { marginTop: 8 },
  prevTitle: { ...typography.caption, color: colors.text.tertiary, marginBottom: 8 },
  prevRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  prevBadge: { backgroundColor: '#F0FFF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  prevBadgeText: { ...typography.small, color: '#16A34A', fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  practiceBtn: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  practiceBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  emptyText: { ...typography.body, color: colors.text.secondary, marginBottom: 16 },
  backBtn: { backgroundColor: colors.primary.main, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  backBtnText: { ...typography.button, color: '#FFF' },
  finishTitle: { ...typography.h1, color: colors.text.primary, marginBottom: 8 },
  finishSubtitle: { ...typography.body, color: colors.text.secondary, marginBottom: 24 },
  scoreBreakdown: { width: '100%', gap: 8, marginBottom: 24 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreIdx: { ...typography.small, color: colors.text.tertiary, width: 24 },
  scoreBar: { flex: 1, height: 8, backgroundColor: colors.border.light, borderRadius: 4, overflow: 'hidden' },
  scoreFill: { height: '100%', backgroundColor: colors.primary.main, borderRadius: 4 },
  scoreVal: { ...typography.small, color: colors.text.secondary, width: 36 },
});
