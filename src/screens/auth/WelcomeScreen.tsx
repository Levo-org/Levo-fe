import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as AppleAuthentication from 'expo-apple-authentication';
import type { AuthStackParamList, User, LanguageProfile } from '../../types';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { extractGoogleIdToken, loadGoogleSigninModule } from '../../utils/googleSignin';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen(_props: Props) {
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAuthStore();
  const insets = useSafeAreaInsets();

  const mapAuthUserToUser = (user: {
    _id: string;
    email: string;
    name: string;
    profileImage?: string;
    activeLanguage: string;
    isPremium?: boolean;
    coins?: number;
  }): User => ({
    _id: user._id,
    email: user.email,
    name: user.name,
    profileImage: user.profileImage || '',
    activeLanguage: user.activeLanguage,
    isPremium: user.isPremium ?? false,
    coins: user.coins ?? 0,
    settings: {
      dailyGoalMinutes: 10,
      notificationEnabled: true,
      notificationHour: 9,
      soundEnabled: true,
      effectsEnabled: true,
    },
  });

  const hydrateProfileIfExists = async (
    fallbackUser: User,
    tokens: { accessToken: string; refreshToken: string; expiresIn?: number },
    isNewUser: boolean
  ) => {
    await setAuthenticated(fallbackUser, tokens, null);

    if (isNewUser) {
      return;
    }

    try {
      const { data: meRes } = await authService.getMe();
      if (meRes.success && meRes.data) {
        const languageProfile: LanguageProfile | null = meRes.data.languageProfile ?? null;
        await setAuthenticated(meRes.data.user, tokens, languageProfile);
      }
    } catch (error: unknown) {
      console.warn('[WelcomeScreen] Failed to hydrate profile after login:', error);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;

    const googleSigninModule = loadGoogleSigninModule();
    if (!googleSigninModule) {
      Alert.alert('Google 로그인 안내', 'Expo Go에서는 Google 로그인을 사용할 수 없습니다. iOS 개발 빌드로 실행해주세요.');
      return;
    }

    const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = googleSigninModule;

    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const signInResponse = await GoogleSignin.signIn();
      if (isSuccessResponse && !isSuccessResponse(signInResponse)) {
        return;
      }

      const idToken = extractGoogleIdToken(signInResponse);
      if (!idToken) {
        Alert.alert('로그인 실패', 'Google ID 토큰을 가져오지 못했습니다. 다시 시도해주세요.');
        return;
      }

      const { data: res } = await authService.loginWithGoogle(idToken);
      if (res.success && res.data) {
        const { user, tokens } = res.data;
        await hydrateProfileIfExists(mapAuthUserToUser(user), tokens, user.isNewUser);
      } else {
        Alert.alert('로그인 실패', res.message || '다시 시도해주세요.');
      }
    } catch (error: unknown) {
      if (isErrorWithCode?.(error)) {
        if (error.code === statusCodes?.IN_PROGRESS) {
          return;
        }

        if (error.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
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
    if (loading || Platform.OS !== 'ios') return;

    setLoading(true);

    try {
      const isAppleAuthAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAppleAuthAvailable) {
        Alert.alert('지원되지 않음', '현재 기기에서는 Apple 로그인을 사용할 수 없습니다.');
        return;
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        Alert.alert('로그인 실패', 'Apple ID 토큰을 가져오지 못했습니다. 다시 시도해주세요.');
        return;
      }

      const givenName = credential.fullName?.givenName?.trim();
      const familyName = credential.fullName?.familyName?.trim();
      const fullName = [givenName, familyName].filter(Boolean).join(' ').trim();

      const { data: res } = await authService.loginWithApple(credential.identityToken, fullName || undefined);
      if (res.success && res.data) {
        const { user, tokens } = res.data;
        await hydrateProfileIfExists(mapAuthUserToUser(user), tokens, user.isNewUser);
      } else {
        Alert.alert('로그인 실패', res.message || '다시 시도해주세요.');
      }
    } catch (error: unknown) {
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: unknown }).code : undefined;
      if (errorCode === 'ERR_REQUEST_CANCELED') {
        return;
      }

      console.error('[WelcomeScreen] Apple login failed:', error);
      Alert.alert('로그인 실패', 'Apple 로그인 중 문제가 발생했습니다. 다시 시도해주세요.');
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
            <View style={styles.appleButtonWrapper}>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={16}
                style={styles.appleNativeButton}
                onPress={handleAppleLogin}
              />
              {loading && (
                <View style={styles.appleLoadingOverlay}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                </View>
              )}
            </View>
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
  appleButtonWrapper: {
    width: '100%',
    position: 'relative',
  },
  appleNativeButton: {
    width: '100%',
    height: 54,
  },
  appleLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});
