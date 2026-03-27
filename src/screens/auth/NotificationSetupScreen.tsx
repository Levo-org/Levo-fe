import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'NotificationSetup'>;

const HOURS = [7, 8, 9, 12, 18, 20, 21];
const LANGUAGE_CODE_MAP: Record<string, string> = {
  english: 'en',
  japanese: 'ja',
  chinese: 'zh',
};

export default function NotificationSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const { setNotification, targetLanguage, level, dailyGoalMinutes, reset } = useOnboardingStore();
  const { setAuthenticated, tokens, user } = useAuthStore();

  const handleStart = async () => {
    if (submitting) return;

    if (!targetLanguage || !level) {
      Alert.alert('온보딩 정보가 부족해요', '언어와 난이도를 먼저 선택해주세요.');
      navigation.navigate('LanguageSelect');
      return;
    }

    if (!tokens || !user) {
      Alert.alert('세션 오류', '로그인 세션을 확인할 수 없어 다시 로그인해주세요.');
      return;
    }

    setSubmitting(true);
    setNotification(notifEnabled, selectedHour);

    try {
      const languageCode = LANGUAGE_CODE_MAP[targetLanguage] ?? targetLanguage;

      const { data: onboardingRes } = await authService.completeOnboarding({
        targetLanguage: languageCode,
        level,
        dailyGoalMinutes: dailyGoalMinutes ?? 10,
        notificationEnabled: notifEnabled,
        notificationHour: selectedHour,
      });

      if (!onboardingRes.success || !onboardingRes.data) {
        Alert.alert('온보딩 저장 실패', onboardingRes.message || '잠시 후 다시 시도해주세요.');
        return;
      }

      let nextUser = onboardingRes.data.user;

      try {
        const { data: settingsRes } = await userService.updateSettings({
          dailyGoalMinutes: dailyGoalMinutes ?? 10,
          notificationEnabled: notifEnabled,
          notificationHour: selectedHour,
        });

        if (settingsRes.success && settingsRes.data) {
          const maybeSettings = (settingsRes.data as { settings?: typeof nextUser.settings }).settings;
          const mergedSettings = maybeSettings ?? nextUser.settings;
          nextUser = { ...nextUser, settings: mergedSettings };
        }
      } catch (error: unknown) {
        console.warn('[NotificationSetupScreen] Failed to update notification settings:', error);
      }

      await setAuthenticated(nextUser, tokens, onboardingRes.data.languageProfile);
      reset();
    } catch (error: unknown) {
      console.warn('[NotificationSetupScreen] Failed to complete onboarding:', error);
      Alert.alert('온보딩 저장 실패', '기본 정보 저장 중 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '오전 12:00';
    if (hour < 12) return `오전 ${hour}:00`;
    if (hour === 12) return '오후 12:00';
    return `오후 ${hour - 12}:00`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          학습 알림을{'\n'}받아볼까요?
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.bellArea}>
          <Text style={styles.bell}>🔔</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>학습 알림</Text>
          <Switch
            value={notifEnabled}
            onValueChange={setNotifEnabled}
            trackColor={{ false: colors.background.tertiary, true: colors.primary.light }}
            thumbColor={notifEnabled ? colors.primary.main : '#f4f3f4'}
          />
        </Animated.View>

        {notifEnabled && (
          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.timeSection}>
            <Text style={styles.timeLabel}>알림 시간</Text>
            <View style={styles.timeOptions}>
              {HOURS.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.timeChip,
                    selectedHour === hour && styles.timeChipSelected,
                  ]}
                  onPress={() => setSelectedHour(hour)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.timeChipText,
                    selectedHour === hour && styles.timeChipTextSelected,
                  ]}>
                    {formatHour(hour)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </View>

      <View style={styles.footer}>
          <TouchableOpacity
          style={[styles.startButton, submitting && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>{submitting ? '저장 중...' : '시작하기 🎉'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
    gap: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary.main,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 24,
  },
  bellArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bell: {
    fontSize: 72,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  toggleLabel: {
    ...typography.h3,
    color: colors.text.primary,
  },
  timeSection: {
    gap: 12,
  },
  timeLabel: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeChipSelected: {
    borderColor: colors.primary.main,
    backgroundColor: '#F0FFF0',
  },
  timeChipText: {
    ...typography.small,
    color: colors.text.primary,
    fontWeight: '500',
  },
  timeChipTextSelected: {
    color: colors.primary.main,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  startButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.7,
  },
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
