import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
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

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const signInResponse = await GoogleSignin.signIn();
      if (!isSuccessResponse(signInResponse)) {
        return;
      }

      const idToken = signInResponse.data.idToken;
      if (!idToken) {
        Alert.alert('로그인 실패', 'Google ID 토큰을 가져오지 못했습니다. 다시 시도해주세요.');
        return;
      }

      const { data: res } = await authService.loginWithGoogle(idToken);
      if (res.success && res.data) {
        const { user, tokens } = res.data;
        const mappedUser = {
          _id: user._id,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage || '',
          activeLanguage: user.activeLanguage,
          isPremium: user.isPremium,
          coins: user.coins,
          settings: {
            dailyGoalMinutes: 10,
            notificationEnabled: true,
            notificationHour: 9,
            soundEnabled: true,
            effectsEnabled: true,
          },
        };

        await setAuthenticated(mappedUser, tokens, null);
      } else {
        Alert.alert('로그인 실패', res.message || '다시 시도해주세요.');
      }
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.IN_PROGRESS) {
          return;
        }

        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert('Google Play 서비스 필요', 'Google Play 서비스를 업데이트한 뒤 다시 시도해주세요.');
          return;
        }
      }

      console.error('[WelcomeScreen] Google login failed:', error);
      Alert.alert('로그인 실패', 'Google 로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    Alert.alert('준비 중', 'Apple 로그인은 아직 준비 중입니다.');
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
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} activeOpacity={0.8} disabled={loading}>
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
            <TouchableOpacity style={styles.appleButton} onPress={handleAppleLogin} activeOpacity={0.8} disabled={loading}>
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
});
