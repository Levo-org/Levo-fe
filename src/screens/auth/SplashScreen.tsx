import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withTiming(1, { duration: 600 });
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, logoStyle]}>LEVO</Animated.Text>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          언어 학습의 새로운 시작
        </Animated.Text>
      </View>
      <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
