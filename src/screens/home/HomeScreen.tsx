import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, HomeData } from '../../types';
import TopBar from '../../components/TopBar';
import ProgressIndicator from '../../components/ProgressIndicator';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import { homeService } from '../../services/home.service';
import { getTodayAppUsageSeconds } from '../../services/appUsage.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORY_META: Record<string, { emoji: string; title: string; desc: string; screen: string; color: string }> = {
  vocabulary: { emoji: '📝', title: '어휘', desc: '새로운 단어 학습', screen: 'Vocabulary', color: '#58CC02' },
  grammar: { emoji: '📖', title: '문법', desc: '문법 규칙 학습', screen: 'Grammar', color: '#1CB0F6' },
  conversation: { emoji: '💬', title: '회화', desc: '실전 대화 연습', screen: 'Conversation', color: '#CE82FF' },
  listening: { emoji: '🎧', title: '듣기', desc: '듣기 실력 향상', screen: 'ListeningPractice', color: '#FF9600' },
  reading: { emoji: '📚', title: '읽기', desc: '독해 능력 향상', screen: 'ReadingPractice', color: '#FF4B4B' },
};

interface HomeCategoryCard {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  progress: number;
  screen: string;
  color: string;
  total?: number;
  completed?: number;
}

const FALLBACK_CATEGORIES: HomeCategoryCard[] = [
  { id: 'vocabulary', emoji: '📝', title: '어휘', desc: '새로운 단어 학습', progress: 0, screen: 'Vocabulary', color: '#58CC02' },
  { id: 'grammar', emoji: '📖', title: '문법', desc: '문법 규칙 학습', progress: 0, screen: 'Grammar', color: '#1CB0F6' },
  { id: 'conversation', emoji: '💬', title: '회화', desc: '실전 대화 연습', progress: 0, screen: 'Conversation', color: '#CE82FF' },
  { id: 'listening', emoji: '🎧', title: '듣기', desc: '듣기 실력 향상', progress: 0, screen: 'ListeningPractice', color: '#FF9600' },
  { id: 'reading', emoji: '📚', title: '읽기', desc: '독해 능력 향상', progress: 0, screen: 'ReadingPractice', color: '#FF4B4B' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, languageProfile } = useAuthStore();
  const { streak, xp, setStreak, setHearts } = useUserStore();
  const [todayActiveMinutes, setTodayActiveMinutes] = React.useState(0);

  const fetcher = useCallback(
    () => homeService.getHomeData({
      targetLanguage: user?.activeLanguage,
      level: languageProfile?.level,
    }),
    [user?.activeLanguage, languageProfile?.level],
  );
  const { data, loading, refetch } = useApi<HomeData>(fetcher);
  const [refreshing, setRefreshing] = React.useState(false);

  const refreshTodayActiveMinutes = useCallback(async () => {
    const usageSeconds = await getTodayAppUsageSeconds();
    setTodayActiveMinutes(Math.floor(usageSeconds / 60));
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.streak) setStreak(data.streak.current ?? data.streak.currentStreak ?? 0);
    if (data.hearts) setHearts(data.hearts.current);
  }, [data, setStreak, setHearts]);

  useFocusEffect(
    useCallback(() => {
      void refreshTodayActiveMinutes();

      const intervalId = setInterval(() => {
        void refreshTodayActiveMinutes();
      }, 30000);

      return () => clearInterval(intervalId);
    }, [refreshTodayActiveMinutes]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refreshTodayActiveMinutes()]);
    setRefreshing(false);
  };

  const categories: HomeCategoryCard[] = data?.categories
    ? data.categories.map((c) => {
        const meta = CATEGORY_META[c.id] || { emoji: '📋', title: c.label, desc: '', screen: 'Vocabulary', color: '#58CC02' };
        return {
          id: c.id,
          emoji: meta.emoji,
          title: meta.title,
          desc: meta.desc,
          progress: c.progress,
          screen: meta.screen,
          color: meta.color,
          total: c.total ?? 0,
          completed: c.completed ?? 0,
        };
      })
    : FALLBACK_CATEGORIES;

  const dailyGoalMinutes = data?.user?.settings?.dailyGoalMinutes ?? user?.settings?.dailyGoalMinutes ?? 10;
  const todayCompleted = todayActiveMinutes;
  const todayTotal = dailyGoalMinutes;
  const todayProgress = todayTotal > 0 ? Math.min(100, Math.round((todayCompleted / todayTotal) * 100)) : 0;

  return (
    <View style={styles.container}>
      <TopBar
        onHeartsPress={() => navigation.navigate('HeartsDemo')}
        onStreakPress={() => navigation.navigate('StreakDetail')}
        onCoinsPress={() => navigation.navigate('CoinShop')}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary.main} />}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.welcomeSection}>
            <Text style={styles.greeting}>안녕하세요! 👋</Text>
            <Text style={styles.userName}>{user?.name || '학습자'}님</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.streakCard}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakFire}>🔥</Text>
              <View>
                <Text style={styles.streakCount}>{data?.streak?.current ?? streak}일 연속</Text>
                <Text style={styles.streakLabel}>학습 스트릭</Text>
              </View>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{xp} XP</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 학습</Text>
            <View style={styles.todayCard}>
              <View style={styles.todayRow}>
                <Text style={styles.todayLabel}>일일 목표</Text>
                <Text style={styles.todayValue}>{todayCompleted}/{todayTotal}분</Text>
              </View>
              <Text style={styles.todaySubValue}>오늘 앱 사용 시간 기준으로 갱신됩니다</Text>
              <ProgressIndicator current={todayProgress} total={100} color={colors.primary.main} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>학습 카테고리</Text>
            <View style={styles.categories}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate(cat.screen as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                    <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                    <Text style={styles.categoryDesc}>{cat.desc}</Text>
                    <View style={styles.categoryProgress}>
                      <View style={styles.categoryProgressTrack}>
                        <View
                          style={[
                            styles.categoryProgressFill,
                            { width: `${Math.min(cat.progress, 100)}%`, backgroundColor: cat.color },
                          ]}
                        />
                      </View>
                      <Text style={styles.categoryProgressText}>
                        {cat.progress}%{typeof cat.completed === 'number' && typeof cat.total === 'number' ? ` (${cat.completed}/${cat.total})` : ''}
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.text.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <TouchableOpacity
              style={styles.quizCard}
              onPress={() => navigation.navigate('QuizSystem')}
              activeOpacity={0.8}
            >
              <View style={styles.quizLeft}>
                <Text style={styles.quizEmoji}>🏆</Text>
                <View>
                  <Text style={styles.quizTitle}>오늘의 퀴즈</Text>
                  <Text style={styles.quizDesc}>도전하고 XP를 획득하세요!</Text>
                </View>
              </View>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  welcomeSection: { paddingTop: 8, paddingBottom: 16 },
  greeting: { ...typography.body, color: colors.text.secondary },
  userName: { ...typography.h1, color: colors.text.primary },
  streakCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 16, padding: 16, marginBottom: 24 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakFire: { fontSize: 36 },
  streakCount: { ...typography.h3, color: '#FF9600' },
  streakLabel: { ...typography.small, color: colors.text.secondary },
  xpBadge: { backgroundColor: colors.primary.main, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 12 },
  xpText: { ...typography.small, color: '#FFFFFF', fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 12 },
  todayCard: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, gap: 8 },
  todayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayLabel: { ...typography.body, color: colors.text.secondary },
  todayValue: { ...typography.body, color: colors.primary.main, fontWeight: '700' },
  todaySubValue: { ...typography.caption, color: colors.text.secondary },
  categories: { gap: 12 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, gap: 12 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryTitle: { ...typography.body, fontWeight: '700', color: colors.text.primary },
  categoryDesc: { ...typography.caption, color: colors.text.secondary },
  categoryProgress: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  categoryProgressTrack: { flex: 1, height: 4, backgroundColor: colors.background.tertiary, borderRadius: 2 },
  categoryProgressFill: { height: 4, borderRadius: 2 },
  categoryProgressText: { ...typography.caption, color: colors.text.secondary, fontSize: 10 },
  quizCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.primary.main, borderRadius: 16, padding: 20 },
  quizLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  quizEmoji: { fontSize: 32 },
  quizTitle: { ...typography.h3, color: '#FFFFFF' },
  quizDesc: { ...typography.small, color: 'rgba(255,255,255,0.8)' },
});
