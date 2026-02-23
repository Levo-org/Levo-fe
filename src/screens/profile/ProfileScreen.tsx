import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { userService } from '../../services/user.service';
import { useApi } from '../../hooks/useApi';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface ProfileData {
  user: {
    name: string;
    email: string;
    profileImage?: string;
    createdAt?: string;
  };
  languageProfile: {
    targetLanguage: string;
    level: string;
    xp?: number;
    totalXp?: number;
    userLevel?: number;
    lessonsCompleted?: number;
    wordsLearned?: number;
    streak?: number;
    hearts?: number;
  };
}

export default function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { hearts, streak, coins, xp, userLevel } = useUserStore();

  const fetcher = useCallback(() => userService.getMe(), []);
  const { data, loading } = useApi<ProfileData>(fetcher);

  const user = data?.user;
  const profile = data?.languageProfile;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>프로필</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="settings" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.name ?? '사용자'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{userLevel}</Text>
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{profile?.streak ?? streak}</Text>
              <Text style={styles.statLabel}>스트릭</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>{profile?.totalXp ?? xp}</Text>
              <Text style={styles.statLabel}>총 XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📚</Text>
              <Text style={styles.statValue}>{profile?.lessonsCompleted ?? 0}</Text>
              <Text style={styles.statLabel}>레슨 완료</Text>
            </View>
          </Animated.View>

          {/* Quick Info */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.infoSection}>
            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('HeartsDemo')}>
              <Feather name="heart" size={20} color={colors.status.error} />
              <Text style={styles.infoLabel}>하트</Text>
              <Text style={styles.infoValue}>{hearts}/5</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('CoinShop')}>
              <Text style={{ fontSize: 18 }}>🪙</Text>
              <Text style={styles.infoLabel}>코인</Text>
              <Text style={styles.infoValue}>{coins}</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('StreakDetail')}>
              <Text style={{ fontSize: 18 }}>🔥</Text>
              <Text style={styles.infoLabel}>스트릭</Text>
              <Text style={styles.infoValue}>{profile?.streak ?? streak}일</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('Badges')}>
              <Text style={{ fontSize: 18 }}>🏅</Text>
              <Text style={styles.infoLabel}>뱃지</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('Stats')}>
              <Feather name="bar-chart-2" size={20} color={colors.primary.main} />
              <Text style={styles.infoLabel}>학습 통계</Text>
              <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Language */}
          {profile && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.langCard}>
              <Text style={styles.langTitle}>학습 중인 언어</Text>
              <Text style={styles.langValue}>{profile.targetLanguage} · {profile.level}</Text>
              <Text style={styles.langMeta}>단어 {profile.wordsLearned ?? 0}개 학습</Text>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  name: { ...typography.h2, color: colors.text.primary, marginBottom: 4 },
  email: { ...typography.small, color: colors.text.secondary, marginBottom: 8 },
  levelBadge: { backgroundColor: colors.primary.light, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  levelText: { ...typography.caption, color: colors.primary.main, fontWeight: '700' },
  statsGrid: { flexDirection: 'row', backgroundColor: colors.background.secondary, borderRadius: 20, padding: 20, marginBottom: 24, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 20 },
  statValue: { ...typography.h3, color: colors.text.primary },
  statLabel: { ...typography.small, color: colors.text.secondary },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  infoSection: { backgroundColor: colors.background.secondary, borderRadius: 16, marginBottom: 24, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  infoLabel: { flex: 1, ...typography.body, color: colors.text.primary },
  infoValue: { ...typography.body, color: colors.text.secondary, marginRight: 4 },
  langCard: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20 },
  langTitle: { ...typography.small, color: colors.text.secondary, marginBottom: 4 },
  langValue: { ...typography.h4, color: colors.text.primary, marginBottom: 4 },
  langMeta: { ...typography.small, color: colors.text.tertiary },
});
