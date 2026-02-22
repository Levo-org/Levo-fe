import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * A wrapper for screen headers that respects the device safe area (status bar).
 * Use this instead of hardcoded `paddingTop: 60`.
 */
export default function SafeHeader({ children, style }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ paddingTop: insets.top + 8 }, style]}>
      {children}
    </View>
  );
}
