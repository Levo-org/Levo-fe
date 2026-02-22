import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonComplete'>;

export default function LessonCompleteScreen({ navigation, route }: Props) {
  const { score, correctCount, totalQuestions } = route.params;

  const xpEarned = Math.round(score * 0.15) + 5;
  const coinsEarned = Math.round(score * 0.05) + 2;

  const handleContinue = () => {
    navigation.popToTop();
  };

  const handleGoHome = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text entering={ZoomIn.delay(200).duration(600)} style={styles.trophy}>
          🎉
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.title}>
          축하합니다!
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(500).duration(500)} style={styles.subtitle}>
          레슨을 완료했어요
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreLabel}>정확도</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>+{xpEarned}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💎</Text>
            <Text style={styles.statValue}>+{coinsEarned}</Text>
            <Text style={styles.statLabel}>코인</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{correctCount}/{totalQuestions}</Text>
            <Text style={styles.statLabel}>정답</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(800).duration(500)} style={styles.footer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>계속하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} activeOpacity={0.8}>
          <Text style={styles.homeButtonText}>홈으로</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  trophy: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.primary.main,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: {
    fontSize: 24,
  },
  statValue: {
    ...typography.h3,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.background.tertiary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
  continueButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  homeButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
});
