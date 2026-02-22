import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

const BADGES = [
  { id: '1', emoji: '🌟', name: '첫 걸음', desc: '첫 레슨 완료', earned: true, date: '2024.01.15' },
  { id: '2', emoji: '🔥', name: '불꽃 스타터', desc: '7일 연속 학습', earned: true, date: '2024.01.22' },
  { id: '3', emoji: '📚', name: '단어 수집가', desc: '50개 단어 학습', earned: true, date: '2024.02.01' },
  { id: '4', emoji: '🏆', name: '퀴즈 마스터', desc: '퀴즈 10회 완벽 점수', earned: false, date: '' },
  { id: '5', emoji: '💎', name: '다이아몬드', desc: '30일 연속 학습', earned: false, date: '' },
  { id: '6', emoji: '🎯', name: '명사수', desc: '정답률 90% 이상', earned: false, date: '' },
  { id: '7', emoji: '📖', name: '문법 박사', desc: '모든 문법 주제 완료', earned: false, date: '' },
  { id: '8', emoji: '🗣️', name: '대화왕', desc: '모든 회화 상황 완료', earned: false, date: '' },
];

export default function BadgesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const earnedCount = BADGES.filter((b) => b.earned).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>뱃지</Text>
        <Text style={styles.countText}>{earnedCount}/{BADGES.length}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {BADGES.map((badge, index) => (
            <Animated.View key={badge.id} entering={FadeInDown.delay(index * 60).duration(400)} style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}>
              <Text style={[styles.badgeEmoji, !badge.earned && styles.badgeEmojiLocked]}>{badge.emoji}</Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.desc}</Text>
              {badge.earned && <Text style={styles.badgeDate}>{badge.date}</Text>}
              {!badge.earned && <Text style={styles.badgeLock}>🔒</Text>}
            </Animated.View>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  countText: { fontSize: 14, fontWeight: '600', color: '#AFAFAF', width: 40, textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  badgeCardLocked: { opacity: 0.5 },
  badgeEmoji: { fontSize: 40 },
  badgeEmojiLocked: { opacity: 0.4 },
  badgeName: { fontSize: 14, fontWeight: '700', color: '#4B4B4B', textAlign: 'center' },
  badgeNameLocked: { color: '#AFAFAF' },
  badgeDesc: { fontSize: 11, color: '#AFAFAF', textAlign: 'center' },
  badgeDate: { fontSize: 10, color: '#58CC02', fontWeight: '600' },
  badgeLock: { fontSize: 14 },
});
