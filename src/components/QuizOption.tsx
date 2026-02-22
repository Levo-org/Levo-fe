import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type OptionState = 'default' | 'selected' | 'correct' | 'wrong';

interface QuizOptionProps {
  label: string;
  text: string;
  state?: OptionState;
  onPress: () => void;
  disabled?: boolean;
}

const stateColors: Record<OptionState, { bg: string; border: string; text: string }> = {
  default: {
    bg: colors.background.primary,
    border: colors.background.tertiary,
    text: colors.text.primary,
  },
  selected: {
    bg: '#EDF7FF',
    border: colors.accent.blue,
    text: colors.accent.blue,
  },
  correct: {
    bg: '#E8F7E0',
    border: colors.primary.main,
    text: colors.primary.dark,
  },
  wrong: {
    bg: '#FFEBEE',
    border: colors.status.error,
    text: colors.status.error,
  },
};

export default function QuizOption({
  label,
  text,
  state = 'default',
  onPress,
  disabled = false,
}: QuizOptionProps) {
  const colorSet = stateColors[state];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colorSet.bg,
          borderColor: colorSet.border,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.label, { backgroundColor: colorSet.border }]}>
        <Text style={[styles.labelText, { color: state === 'default' ? colors.text.secondary : '#FFFFFF' }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.text, { color: colorSet.text }]} numberOfLines={2}>
        {text}
      </Text>
      {state === 'correct' && (
        <Feather name="check-circle" size={20} color={colors.primary.main} />
      )}
      {state === 'wrong' && (
        <Feather name="x-circle" size={20} color={colors.status.error} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  label: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...typography.small,
    fontWeight: '700',
  },
  text: {
    ...typography.body,
    flex: 1,
    fontWeight: '500',
  },
});
