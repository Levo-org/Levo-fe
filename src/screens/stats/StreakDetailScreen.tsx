import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, StreakData } from '../../types';
import BackButton from '../../components/BackButton';
import { streakService } from '../../services/streak.service';
import { useApi } from '../../hooks/useApi';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'StreakDetail'>;

export default function StreakDetailScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { streak } = useUserStore();

  const fetcher = useCallback(() => streakService.getStreak(), []);
  const { data, loading, refetch } = useApi<StreakData>(fetcher);

  const currentStreak = data?.currentStreak ?? streak;
  const longestStreak = data?.longestStreak ?? 0;
  const shieldsRemaining = data?.shieldsRemaining ?? 0;
  const weekDays = data?.weekDays ?? [];

  const handleUseShield = async () => {
    try {
      const res = await streakService.useShield();
      if (res.data?.success) {
        refetch();
        Alert.alert('성공', '스트릭 실드가 적용되었습니다! 🛡️');
      } else {
        Alert.alert('실패', res.data?.message ?? '실드 사용에 실패했습니다');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '실드 사용에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>스트릭</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Streak */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.streakCard}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>일 연속 학습</Text>
        </Animated.View>

        {/* Week Calendar */}
        {weekDays.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.weekCard}>
            <Text style={styles.weekTitle}>이번 주</Text>
            <View style={styles.weekRow}>
              {weekDays.map((day, idx) => (
                <View key={idx} style={styles.dayCol}>
                  <View style={[styles.dayCircle, day.completed && styles.dayCompleted]}>
                    {day.completed ? (
                      <Feather name="check" size={16} color="#FFF" />
                    ) : (
                      <Text style={styles.dayDot}>·</Text>
                    )}
                  </View>
                  <Text style={[styles.dayLabel, day.completed && styles.dayLabelActive]}>
                    {day.day}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>최장 기록</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🛡️</Text>
            <Text style={styles.statValue}>{shieldsRemaining}</Text>
            <Text style={styles.statLabel}>실드 보유</Text>
          </View>
        </Animated.View>

        {/* Shield */}
        {shieldsRemaining > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <TouchableOpacity style={styles.shieldBtn} onPress={handleUseShield} activeOpacity={0.7}>
              <Text style={{ fontSize: 20 }}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.shieldTitle}>스트릭 실드 사용</Text>
                <Text style={styles.shieldDesc}>오늘 학습을 놓쳐도 스트릭 유지</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.primary.main} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  streakCard: { backgroundColor: '#FFF7ED', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24 },
  fireEmoji: { fontSize: 56, marginBottom: 8 },
  streakNumber: { fontSize: 52, fontWeight: '800', color: '#F59E0B', marginBottom: 4 },
  streakLabel: { ...typography.body, color: '#92400E' },
  weekCard: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 20, marginBottom: 20 },
  weekTitle: { ...typography.h4, color: colors.text.primary, marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.border.light, justifyContent: 'center', alignItems: 'center' },
  dayCompleted: { backgroundColor: colors.primary.main },
  dayDot: { color: colors.text.tertiary, fontSize: 20 },
  dayLabel: { ...typography.small, color: colors.text.tertiary },
  dayLabelActive: { color: colors.primary.main, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { ...typography.h2, color: colors.text.primary },
  statLabel: { ...typography.small, color: colors.text.secondary },
  shieldBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary.light, borderRadius: 16, padding: 16, gap: 12 },
  shieldTitle: { ...typography.body, color: colors.primary.main, fontWeight: '600' },
  shieldDesc: { ...typography.small, color: colors.text.secondary },
});
