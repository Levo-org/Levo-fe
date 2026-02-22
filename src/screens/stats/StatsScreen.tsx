import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PERIODS = ['주', '월', '전체'];
const WEEK_DATA = [
  { day: '월', xp: 45 },
  { day: '화', xp: 80 },
  { day: '수', xp: 30 },
  { day: '목', xp: 65 },
  { day: '금', xp: 90 },
  { day: '토', xp: 50 },
  { day: '일', xp: 20 },
];

export default function StatsScreen() {
  const navigation = useNavigation<Nav>();
  const { xp, streak, userLevel } = useUserStore();
  const [activePeriod, setActivePeriod] = useState(0);
  const maxXp = Math.max(...WEEK_DATA.map((d) => d.xp));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>통계</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, idx) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodTab, activePeriod === idx && styles.periodTabActive]}
              onPress={() => setActivePeriod(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.periodText, activePeriod === idx && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* XP Chart */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.chartCard}>
          <Text style={styles.chartTitle}>주간 XP</Text>
          <View style={styles.chart}>
            {WEEK_DATA.map((d, idx) => (
              <View key={d.day} style={styles.barWrapper}>
                <View style={[styles.bar, { height: (d.xp / maxXp) * 100, backgroundColor: idx === new Date().getDay() - 1 ? '#58CC02' : '#E5E5E5' }]} />
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.statCard, { backgroundColor: '#F0FFF0' }]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statValue, { color: '#58CC02' }]}>{xp}</Text>
            <Text style={styles.statLabel}>총 XP</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.statCard, { backgroundColor: '#FFF8E1' }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: '#FF9600' }]}>{streak}일</Text>
            <Text style={styles.statLabel}>연속 스트릭</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[styles.statCard, { backgroundColor: '#EDF7FF' }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={[styles.statValue, { color: '#1CB0F6' }]}>42분</Text>
            <Text style={styles.statLabel}>이번 주 학습</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={[styles.statValue, { color: '#CE82FF' }]}>78%</Text>
            <Text style={styles.statLabel}>정답률</Text>
          </Animated.View>
        </View>

        {/* Quick Links */}
        <View style={styles.links}>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('StreakDetail')} activeOpacity={0.7}>
            <Text style={styles.linkEmoji}>🔥</Text>
            <Text style={styles.linkTitle}>스트릭 상세</Text>
            <Feather name="chevron-right" size={18} color="#AFAFAF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('Badges')} activeOpacity={0.7}>
            <Text style={styles.linkEmoji}>🏅</Text>
            <Text style={styles.linkTitle}>뱃지 모음</Text>
            <Feather name="chevron-right" size={18} color="#AFAFAF" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodTab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#F7F7F7' },
  periodTabActive: { backgroundColor: '#58CC02' },
  periodText: { fontSize: 14, fontWeight: '600', color: '#AFAFAF' },
  periodTextActive: { color: '#FFFFFF' },
  chartCard: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 20, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#4B4B4B', marginBottom: 16 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barWrapper: { alignItems: 'center', gap: 6, flex: 1 },
  bar: { width: 20, borderRadius: 10, minHeight: 8 },
  barLabel: { fontSize: 12, color: '#AFAFAF', fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#AFAFAF' },
  links: { gap: 8 },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 12, padding: 14, gap: 10 },
  linkEmoji: { fontSize: 20 },
  linkTitle: { fontSize: 15, fontWeight: '600', color: '#4B4B4B', flex: 1 },
});
