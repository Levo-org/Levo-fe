import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { grammarService } from '../../services/grammar.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarDetail'>;

interface GrammarDetail {
  _id: string;
  title: string;
  level: string;
  explanation: string;
  formula: string;
  formulaDesc: string;
  examples: { sentence: string; translation: string }[];
  keyPoints: string[];
  progress: number;
}

export default function GrammarDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { topicId } = route.params;

  const fetcher = useCallback(() => grammarService.getDetail(topicId), [topicId]);
  const { data, loading } = useApi<GrammarDetail>(fetcher);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  const detail = data;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>{detail?.title ?? '문법'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={18} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>설명</Text>
          </View>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationText}>{detail?.explanation ?? ''}</Text>
            {detail?.formula ? (
              <View style={styles.ruleBox}>
                <Text style={styles.ruleTitle}>기본 규칙</Text>
                <Text style={styles.ruleText}>{detail.formula}</Text>
                {detail.formulaDesc ? <Text style={styles.ruleDesc}>{detail.formulaDesc}</Text> : null}
              </View>
            ) : null}
          </View>
        </Animated.View>

        {(detail?.examples?.length ?? 0) > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="message-square" size={18} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>예문</Text>
            </View>
            {detail!.examples.map((ex, idx) => (
              <View key={idx} style={styles.exampleCard}>
                <Text style={styles.exampleEn}>{ex.sentence}</Text>
                <Text style={styles.exampleKo}>{ex.translation}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {(detail?.keyPoints?.length ?? 0) > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="edit-3" size={18} color={colors.accent.purple} />
              <Text style={styles.sectionTitle}>핵심 포인트</Text>
            </View>
            <View style={styles.pointsCard}>
              {detail!.keyPoints.map((point, idx) => (
                <View key={idx} style={styles.pointRow}>
                  <View style={styles.pointBullet} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate('GrammarQuiz', { topicId })}
          activeOpacity={0.8}
        >
          <Feather name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.quizButtonText}>퀴즈 풀기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { ...typography.h3, color: colors.text.primary },
  explanationCard: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, gap: 16 },
  explanationText: { ...typography.body, color: colors.text.primary, lineHeight: 24 },
  ruleBox: { backgroundColor: '#EDF7FF', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: colors.accent.blue },
  ruleTitle: { ...typography.small, color: colors.accent.blue, fontWeight: '700', marginBottom: 4 },
  ruleText: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  ruleDesc: { ...typography.small, color: colors.text.secondary, marginTop: 4 },
  exampleCard: { backgroundColor: colors.background.secondary, borderRadius: 12, padding: 16, marginBottom: 8 },
  exampleEn: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 4 },
  exampleKo: { ...typography.small, color: colors.text.secondary },
  pointsCard: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, gap: 12 },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pointBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent.purple },
  pointText: { ...typography.body, color: colors.text.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, backgroundColor: colors.background.primary },
  quizButton: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  quizButtonText: { ...typography.button, color: '#FFFFFF' },
});
