import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '../stores/userStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface TopBarProps {
  onHeartsPress?: () => void;
  onStreakPress?: () => void;
  onCoinsPress?: () => void;
}

export default function TopBar({ onHeartsPress, onStreakPress, onCoinsPress }: TopBarProps) {
  const { hearts, streak, coins } = useUserStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onHeartsPress} activeOpacity={0.7}>
        <Feather name="heart" size={20} color={colors.status.error} />
        <Text style={styles.heartText}>{hearts}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onStreakPress} activeOpacity={0.7}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <Text style={styles.streakText}>{streak}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onCoinsPress} activeOpacity={0.7}>
        <Text style={styles.coinEmoji}>💎</Text>
        <Text style={styles.coinText}>{coins}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.status.error,
  },
  fireEmoji: {
    fontSize: 18,
  },
  streakText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FF9600',
  },
  coinEmoji: {
    fontSize: 18,
  },
  coinText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.accent.gold,
  },
});
