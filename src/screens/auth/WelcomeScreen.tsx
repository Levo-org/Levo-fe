import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleDevLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data: res } = await authService.devLogin();
      if (res.success && res.data) {
        const { user, tokens } = res.data;
        // Map to our User type (backend returns minimal fields)
        const mappedUser: any = {
          _id: user._id,
          email: user.email,
          name: user.name,
          activeLanguage: user.activeLanguage,
          isPremium: false,
          coins: 0,
          settings: {
            dailyGoalMinutes: 10,
            notificationEnabled: true,
            notificationHour: 9,
            soundEnabled: true,
            effectsEnabled: true,
          },
        };
        await setAuthenticated(mappedUser, tokens, null);
        // Navigation happens automatically via isAuthenticated in RootNavigator
      } else {
        Alert.alert('로그인 실패', res.message || '다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('[WelcomeScreen] Dev login failed:', error?.message);
      Alert.alert('연결 실패', '서버에 연결할 수 없습니다.\n백엔드가 실행 중인지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.illustrationArea}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📚</Text>
          <Text style={styles.logoText}>LEVO</Text>
        </Animated.View>
      </View>

      <View style={[styles.bottomSection, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.title}>
          새로운 언어를{'\n'}배워볼까요?
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(400).duration(500)} style={styles.subtitle}>
          재미있고 효과적인 방법으로 외국어를 마스터하세요
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.buttons}>
          <TouchableOpacity style={styles.googleButton} onPress={handleDevLogin} activeOpacity={0.8} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>Google로 시작하기</Text>
              </>
            )}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.appleButton} onPress={handleDevLogin} activeOpacity={0.8} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="smartphone" size={20} color="#FFFFFF" />
                  <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <Text style={styles.devNote}>⚠️ 개발 모드: 클릭 시 테스트 계정으로 자동 로그인</Text>
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
  devNote: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
