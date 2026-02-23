import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, BounceIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { lessonService } from '../../services/lesson.service';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonComplete'>;

interface CompleteResult {
  xpEarned: number;
  coinsEarned: number;
  newLevel?: number;
}

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { lessonId, score, correctCount, totalQuestions, timeSpentSeconds } = route.params;
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { setXp, setCoins, xp, coins } = useUserStore();

  useEffect(() => {
    const complete = async () => {
      try {
        const res = await lessonService.completeLesson(lessonId, {
          score,
          correctCount,
          totalQuestions,
          timeSpentSeconds: timeSpentSeconds ?? 0,
        });
        if (res.data?.success) {
          const d = res.data.data as any;
          setResult({
            xpEarned: d.xpEarned ?? 15,
            coinsEarned: d.coinsEarned ?? 5,
            newLevel: d.newLevel,
          });
          setXp(xp + (d.xpEarned ?? 15));
          setCoins(coins + (d.coinsEarned ?? 5));
        } else {
          setResult({ xpEarned: 15, coinsEarned: 5 });
        }
      } catch {
        setResult({ xpEarned: 15, coinsEarned: 5 });
      } finally {
        setLoading(false);
      }
    };
    complete();
  }, []);

  const isPerfect = score === 100;
  const isGood = score >= 70;

  const handleContinue = () => {
    navigation.popToTop();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={[styles.loadingText, { marginTop: 12 }]}>결과 저장 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.content}>
        {/* Big emoji */}
        <Animated.View entering={BounceIn.delay(200).duration(600)}>
          <Text style={styles.bigEmoji}>
            {isPerfect ? '🏆' : isGood ? '🎉' : '💪'}
          </Text>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.title}>
          {isPerfect ? '완벽해요!' : isGood ? '잘했어요!' : '좋은 시도예요!'}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(500).duration(500)} style={styles.subtitle}>
          {isPerfect
            ? '모든 문제를 맞혔습니다!'
            : `${totalQuestions}문제 중 ${correctCount}개 정답`}
        </Animated.Text>

        {/* Score circle */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.scoreCircle}>
          <Text style={[styles.scoreNumber, { color: isPerfect ? '#16A34A' : isGood ? colors.primary.main : colors.status.error }]}>
            {score}
          </Text>
          <Text style={styles.scorePercent}>점</Text>
        </Animated.View>

        {/* Rewards */}
        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.rewards}>
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>⭐</Text>
            <Text style={styles.rewardValue}>+{result?.xpEarned ?? 15}</Text>
            <Text style={styles.rewardLabel}>XP</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardItem}>
            <Text style={styles.rewardEmoji}>🪙</Text>
            <Text style={styles.rewardValue}>+{result?.coinsEarned ?? 5}</Text>
            <Text style={styles.rewardLabel}>코인</Text>
          </View>
          {timeSpentSeconds != null && (
            <>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={styles.rewardEmoji}>⏱️</Text>
                <Text style={styles.rewardValue}>{Math.floor(timeSpentSeconds / 60)}:{String(timeSpentSeconds % 60).padStart(2, '0')}</Text>
                <Text style={styles.rewardLabel}>소요 시간</Text>
              </View>
            </>
          )}
        </Animated.View>

        {result?.newLevel && (
          <Animated.View entering={FadeInDown.delay(800).duration(500)} style={styles.levelUp}>
            <Feather name="trending-up" size={20} color={colors.primary.main} />
            <Text style={styles.levelUpText}>레벨 {result.newLevel} 달성! 🎊</Text>
          </Animated.View>
        )}
      </View>

      <Animated.View entering={FadeInUp.delay(900).duration(500)} style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueText}>계속하기</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  bigEmoji: { fontSize: 72, marginBottom: 8 },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: 20 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.background.secondary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  scoreNumber: { fontSize: 40, fontWeight: '800' },
  scorePercent: { ...typography.small, color: colors.text.secondary },
  rewards: { flexDirection: 'row', backgroundColor: colors.background.secondary, borderRadius: 20, padding: 20, alignItems: 'center', width: '100%' },
  rewardItem: { flex: 1, alignItems: 'center', gap: 4 },
  rewardEmoji: { fontSize: 24 },
  rewardValue: { ...typography.h3, color: colors.text.primary },
  rewardLabel: { ...typography.small, color: colors.text.secondary },
  rewardDivider: { width: 1, height: 40, backgroundColor: colors.border.light },
  levelUp: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FFF4', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  levelUpText: { ...typography.body, color: colors.primary.main, fontWeight: '600' },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  continueButton: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  continueText: { ...typography.button, color: '#FFFFFF', fontSize: 18 },
  loadingText: { ...typography.body, color: colors.text.secondary },
});
