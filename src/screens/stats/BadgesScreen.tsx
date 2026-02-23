import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Badge } from '../../types';
import BackButton from '../../components/BackButton';
import { badgeService } from '../../services/badge.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

interface BadgesData {
  achievedCount: number;
  totalCount: number;
  badges: Badge[];
}

const CATEGORIES = ['전체', '학습', '스트릭', '퀴즈', '특별'];

export default function BadgesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState(0);

  const fetcher = useCallback(
    () => badgeService.getBadges(selectedTab === 0 ? undefined : CATEGORIES[selectedTab]),
    [selectedTab],
  );
  const { data, loading, refetch } = useApi<BadgesData>(fetcher);

  const handleTabChange = (idx: number) => {
    setSelectedTab(idx);
    setTimeout(refetch, 0);
  };

  const badges = data?.badges ?? [];
  const achieved = data?.achievedCount ?? badges.filter(b => b.earned).length;
  const total = data?.totalCount ?? badges.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>뱃지</Text>
        <Text style={styles.headerCount}>{achieved}/{total}</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        {CATEGORIES.map((cat, idx) => (
          <TouchableOpacity
            key={cat}
            style={[styles.tab, selectedTab === idx && styles.tabActive]}
            onPress={() => handleTabChange(idx)}
          >
            <Text style={[styles.tabText, selectedTab === idx && styles.tabTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {badges.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏅</Text>
              <Text style={styles.emptyText}>뱃지가 없습니다</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {badges.map((badge, idx) => (
                <Animated.View entering={FadeInDown.delay(idx * 50).duration(300)} key={badge._id ?? idx} style={styles.badgeCard}>
                  <View style={[styles.badgeIcon, !badge.earned && styles.badgeLocked]}>
                    <Text style={[styles.badgeEmoji, !badge.earned && { opacity: 0.3 }]}>
                      {badge.icon ?? '🏅'}
                    </Text>
                  </View>
                  <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                  <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                  {badge.earned && badge.earnedAt && (
                    <Text style={styles.badgeDate}>
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </Text>
                  )}
                  {!badge.earned && (
                    <Feather name="lock" size={14} color={colors.text.tertiary} style={{ marginTop: 4 }} />
                  )}
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  headerCount: { ...typography.caption, color: colors.text.secondary },
  tabScroll: { maxHeight: 44, marginBottom: 12 },
  tabContainer: { paddingHorizontal: 20, gap: 8 },
  tab: { backgroundColor: colors.background.secondary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  tabActive: { backgroundColor: colors.primary.main },
  tabText: { ...typography.caption, color: colors.text.secondary },
  tabTextActive: { color: '#FFF', fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: '47%', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, alignItems: 'center' },
  badgeIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeLocked: { backgroundColor: colors.border.light },
  badgeEmoji: { fontSize: 28 },
  badgeName: { ...typography.caption, color: colors.text.primary, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  badgeNameLocked: { color: colors.text.tertiary },
  badgeDesc: { ...typography.small, color: colors.text.secondary, textAlign: 'center', lineHeight: 16 },
  badgeDate: { ...typography.small, color: colors.text.tertiary, marginTop: 4, fontSize: 10 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...typography.body, color: colors.text.secondary },
});
