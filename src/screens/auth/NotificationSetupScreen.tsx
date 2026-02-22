import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'NotificationSetup'>;

const HOURS = [7, 8, 9, 12, 18, 20, 21];

export default function NotificationSetupScreen({ navigation }: Props) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedHour, setSelectedHour] = useState(7);
  const { setNotification, targetLanguage, level, dailyGoalMinutes } = useOnboardingStore();
  const { setAuthenticated } = useAuthStore();

  const handleStart = async () => {
    setNotification(notifEnabled, selectedHour);

    // TODO: Call API to complete onboarding
    // For now, set a mock user as authenticated
    const mockUser = {
      _id: 'mock-user-1',
      name: '학습자',
      email: 'user@example.com',
      profileImage: '',
      activeLanguage: targetLanguage || 'english',
      isPremium: false,
      coins: 0,
      settings: {
        dailyGoalMinutes: dailyGoalMinutes || 10,
        notificationEnabled: notifEnabled,
        notificationHour: selectedHour,
        soundEnabled: true,
        effectsEnabled: true,
      },
    };

    const mockTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
    };

    const mockProfile = {
      targetLanguage: targetLanguage || 'english',
      level: level || 'beginner',
      xp: 0,
      userLevel: 1,
      hearts: 5,
      vocabularyProgress: 0,
      grammarProgress: 0,
      conversationProgress: 0,
      listeningProgress: 0,
      readingProgress: 0,
      quizProgress: 0,
    };

    setAuthenticated(mockUser as any, mockTokens as any, mockProfile as any);
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '오전 12:00';
    if (hour < 12) return `오전 ${hour}:00`;
    if (hour === 12) return '오후 12:00';
    return `오후 ${hour - 12}:00`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
          style={styles.startButton}
          onPress={handleStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>시작하기 🎉</Text>
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
    paddingTop: 60,
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
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
