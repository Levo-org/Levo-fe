import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'FlashcardComplete'>;

export default function FlashcardCompleteScreen({ navigation, route }: Props) {
  const { totalCards, knownCards, wrongWordIds, chapter } = route.params;
  const unknownCards = totalCards - knownCards;
  const percentage = Math.round((knownCards / totalCards) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text entering={ZoomIn.delay(200).duration(500)} style={styles.emoji}>
          {percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '💪'}
        </Animated.Text>

        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.title}>
          플래시카드 완료!
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.resultCard}>
          <View style={styles.resultRow}>
            <View style={[styles.resultItem, { backgroundColor: '#E8F7E0' }]}>
              <Text style={[styles.resultValue, { color: colors.primary.main }]}>{knownCards}</Text>
              <Text style={styles.resultLabel}>알고 있는 단어</Text>
            </View>
            <View style={[styles.resultItem, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.resultValue, { color: colors.status.error }]}>{unknownCards}</Text>
              <Text style={styles.resultLabel}>모르는 단어</Text>
            </View>
          </View>
          <View style={styles.percentRow}>
            <Text style={styles.percentValue}>{percentage}%</Text>
            <Text style={styles.percentLabel}>정답률</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.xpRow}>
          <Text style={styles.xpEmoji}>⭐</Text>
          <Text style={styles.xpText}>+{knownCards * 2} XP 획득!</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {wrongWordIds.length > 0 && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.replace('Flashcard', {
              chapter,
              wordIds: wrongWordIds,
            })}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>모르는 단어 다시 학습</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>완료</Text>
        </TouchableOpacity>
      </View>
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
  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 32,
  },
  resultCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 4,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  resultLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  percentRow: {
    alignItems: 'center',
    gap: 4,
  },
  percentValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary.main,
  },
  percentLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpEmoji: {
    fontSize: 24,
  },
  xpText: {
    ...typography.h3,
    color: colors.primary.main,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
  retryButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  retryButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    ...typography.button,
    color: colors.text.secondary,
  },
});
