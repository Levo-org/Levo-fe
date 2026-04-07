import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '../stores/userStore';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface TopBarProps {
  onStreakPress?: () => void;
}

export default function TopBar({ onStreakPress }: TopBarProps) {
  const { streak } = useUserStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onStreakPress} activeOpacity={0.7}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <Text style={styles.streakText}>{streak}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  fireEmoji: {
    fontSize: 18,
  },
  streakText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FF9600',
  },
});
