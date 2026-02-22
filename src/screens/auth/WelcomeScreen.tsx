import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    navigation.navigate('LanguageSelect');
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple OAuth
    navigation.navigate('LanguageSelect');
  };

  return (
    <View style={styles.container}>
      <View style={styles.illustrationArea}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📚</Text>
          <Text style={styles.logoText}>LEVO</Text>
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          새로운 언어를{'\n'}배워볼까요?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.subtitle}>
          재미있고 효과적인 방법으로 외국어를 마스터하세요
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.buttons}>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.8}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Google로 시작하기</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin} activeOpacity={0.8}>
              <Feather name="smartphone" size={20} color="#FFFFFF" />
              <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('LanguageSelect')} activeOpacity={0.7}>
            <Text style={styles.browseText}>둘러보기</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0FFF0',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary.main,
    letterSpacing: 2,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 32,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  buttons: {
    gap: 12,
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    gap: 8,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    gap: 8,
  },
  appleButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  browseText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 8,
  },
});
