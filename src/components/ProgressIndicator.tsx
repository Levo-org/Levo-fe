import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  label?: string;
}

export default function ProgressIndicator({
  current,
  total,
  height = 8,
  color = colors.primary.main,
  backgroundColor = colors.background.tertiary,
  showLabel = false,
  label,
}: ProgressIndicatorProps) {
  const progress = useSharedValue(0);
  const percentage = total > 0 ? (current / total) * 100 : 0;

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 600 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label || `${current}/${total}`}</Text>
          <Text style={styles.percentText}>{Math.round(percentage)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.fill,
            { height, backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  percentText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  track: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
