import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { useUserStore } from '../../stores/userStore';

type Props = NativeStackScreenProps<RootStackParamList, 'StreakDetail'>;

const WEEK_DAYS = [
  { day: '월', completed: true },
  { day: '화', completed: true },
  { day: '수', completed: true },
  { day: '목', completed: true },
  { day: '금', completed: false },
  { day: '토', completed: false },
  { day: '일', completed: false },
];

export default function StreakDetailScreen({ navigation }: Props) {
  const { streak } = useUserStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>스트릭</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.mainCard}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{streak}</Text>
          <Text style={styles.streakLabel}>일 연속 학습</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.weekCard}>
          <Text style={styles.weekTitle}>이번 주</Text>
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((d) => (
              <View key={d.day} style={styles.dayItem}>
                <View style={[styles.dayCircle, d.completed && styles.dayCircleCompleted]}>
                  {d.completed ? (
                    <Feather name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.dayDot}>•</Text>
                  )}
                </View>
                <Text style={[styles.dayLabel, d.completed && styles.dayLabelCompleted]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.statItem}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>현재 스트릭</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>최장 스트릭</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>스트릭 실드</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.shieldCard}>
          <View style={styles.shieldLeft}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
            <View>
              <Text style={styles.shieldTitle}>스트릭 실드</Text>
              <Text style={styles.shieldDesc}>하루 놓쳐도 스트릭이 유지돼요</Text>
            </View>
          </View>
          <Text style={styles.shieldCount}>2개 보유</Text>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  mainCard: { alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 24, padding: 32, marginBottom: 20, gap: 4 },
  fireEmoji: { fontSize: 56 },
  streakCount: { fontSize: 48, fontWeight: '800', color: '#FF9600' },
  streakLabel: { fontSize: 16, color: '#AFAFAF' },
  weekCard: { backgroundColor: '#F7F7F7', borderRadius: 16, padding: 20, marginBottom: 20 },
  weekTitle: { fontSize: 16, fontWeight: '700', color: '#4B4B4B', marginBottom: 16 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E5E5', justifyContent: 'center', alignItems: 'center' },
  dayCircleCompleted: { backgroundColor: '#58CC02' },
  dayDot: { fontSize: 16, color: '#AFAFAF' },
  dayLabel: { fontSize: 12, color: '#AFAFAF', fontWeight: '500' },
  dayLabelCompleted: { color: '#58CC02', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statItem: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 12, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#4B4B4B' },
  statLabel: { fontSize: 11, color: '#AFAFAF' },
  shieldCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#EDF7FF', borderRadius: 16, padding: 16 },
  shieldLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shieldEmoji: { fontSize: 32 },
  shieldTitle: { fontSize: 15, fontWeight: '700', color: '#4B4B4B' },
  shieldDesc: { fontSize: 12, color: '#AFAFAF' },
  shieldCount: { fontSize: 14, fontWeight: '700', color: '#1CB0F6' },
});
