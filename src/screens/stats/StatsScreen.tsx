import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { statsService } from '../../services/stats.service';
import { useApi } from '../../hooks/useApi';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Stats'>;

interface StatsData {
  weeklyXp: { day: string; xp: number }[];
  totalStudyMinutes: number;
  accuracy: number;
  lessonsCompleted: number;
  wordsLearned: number;
  quizzesCompleted: number;
}

const PERIODS = ['주', '월', '전체'] as const;
const PERIOD_MAP: Record<string, 'week' | 'month' | 'all'> = { '주': 'week', '월': 'month', '전체': 'all' };

export default function StatsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { xp, streak } = useUserStore();
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  const fetcher = useCallback(
    () => statsService.getStats(PERIOD_MAP[PERIODS[selectedPeriod]]),
    [selectedPeriod],
  );
  const { data, loading, refetch } = useApi<StatsData>(fetcher);

  const handlePeriodChange = (idx: number) => {
    setSelectedPeriod(idx);
    // refetch will happen via useApi since fetcher changes
    setTimeout(refetch, 0);
  };

  const weeklyXp = data?.weeklyXp ?? [];
  const maxXp = Math.max(...weeklyXp.map(d => d.xp), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>학습 통계</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period selector */}
          <View style={styles.periodRow}>
            {PERIODS.map((p, idx) => (
              <TouchableOpacity
                key={p}
                style={[styles.periodTab, selectedPeriod === idx && styles.periodTabActive]}
                onPress={() => handlePeriodChange(idx)}
              >
                <Text style={[styles.periodText, selectedPeriod === idx && styles.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* XP Chart */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.chartCard}>
            <Text style={styles.chartTitle}>XP 그래프</Text>
            <View style={styles.chartArea}>
              {weeklyXp.map((d, idx) => (
                <View key={idx} style={styles.barCol}>
                  <View style={[styles.bar, { height: Math.max((d.xp / maxXp) * 100, 4), backgroundColor: d.xp > 0 ? colors.primary.main : colors.border.light }]} />
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              ))}
              {weeklyXp.length === 0 && (
                <Text style={styles.emptyChart}>데이터가 없습니다</Text>
              )}
            </View>
          </Animated.View>

          {/* Summary Stats */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>⏱️</Text>
              <Text style={styles.summaryValue}>{data?.totalStudyMinutes ?? 0}분</Text>
              <Text style={styles.summaryLabel}>학습 시간</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🎯</Text>
              <Text style={styles.summaryValue}>{data?.accuracy ?? 0}%</Text>
              <Text style={styles.summaryLabel}>정답률</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>📚</Text>
              <Text style={styles.summaryValue}>{data?.lessonsCompleted ?? 0}</Text>
              <Text style={styles.summaryLabel}>레슨 완료</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>📝</Text>
              <Text style={styles.summaryValue}>{data?.wordsLearned ?? 0}</Text>
              <Text style={styles.summaryLabel}>단어 학습</Text>
            </View>
          </Animated.View>

          {/* Quick Links */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('StreakDetail')}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
              <Text style={styles.linkText}>스트릭 상세</Text>
              <Text style={styles.linkValue}>{streak}일</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Badges')}>
              <Text style={{ fontSize: 20 }}>🏅</Text>
              <Text style={styles.linkText}>뱃지</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  periodRow: { flexDirection: 'row', backgroundColor: colors.background.secondary, borderRadius: 12, padding: 4, marginBottom: 20 },
  periodTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  periodTabActive: { backgroundColor: colors.primary.main },
  periodText: { ...typography.caption, color: colors.text.secondary },
  periodTextActive: { color: '#FFF', fontWeight: '700' },
  chartCard: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 20, marginBottom: 20 },
  chartTitle: { ...typography.h4, color: colors.text.primary, marginBottom: 16 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 120 },
  barCol: { alignItems: 'center', gap: 6 },
  bar: { width: 28, borderRadius: 6 },
  barLabel: { ...typography.small, color: colors.text.tertiary },
  emptyChart: { ...typography.body, color: colors.text.tertiary },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  summaryItem: { width: '47%', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  summaryEmoji: { fontSize: 20 },
  summaryValue: { ...typography.h3, color: colors.text.primary },
  summaryLabel: { ...typography.small, color: colors.text.secondary },
  linkRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  linkText: { flex: 1, ...typography.body, color: colors.text.primary },
  linkValue: { ...typography.body, color: colors.text.secondary, marginRight: 4 },
});
