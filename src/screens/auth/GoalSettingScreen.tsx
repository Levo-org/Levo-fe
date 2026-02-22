import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'GoalSetting'>;

const GOALS = [
  { minutes: 5, label: '5분', desc: '가볍게', emoji: '🚶' },
  { minutes: 10, label: '10분', desc: '적당히', emoji: '🏃' },
  { minutes: 15, label: '15분', desc: '열심히', emoji: '🔥' },
  { minutes: 20, label: '20분', desc: '집중적으로', emoji: '🚀' },
];

export default function GoalSettingScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const { setDailyGoal } = useOnboardingStore();

  const handleNext = () => {
    if (selected !== null) {
      setDailyGoal(selected);
      navigation.navigate('NotificationSetup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          하루 목표를{'\n'}설정해볼까요?
        </Animated.Text>
        <Text style={styles.subtitle}>매일 꾸준히 하는 것이 가장 중요해요</Text>

        <View style={styles.options}>
          {GOALS.map((goal, index) => (
            <Animated.View key={goal.minutes} entering={FadeInDown.delay(200 + index * 100).duration(500)}>
              <TouchableOpacity
                style={[
                  styles.card,
                  selected === goal.minutes && styles.cardSelected,
                ]}
                onPress={() => setSelected(goal.minutes)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{goal.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.goalLabel, selected === goal.minutes && styles.goalLabelSelected]}>
                    {goal.label}
                  </Text>
                  <Text style={styles.goalDesc}>{goal.desc}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selected === null && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selected === null}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, selected === null && styles.nextButtonTextDisabled]}>
            다음
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: '#F0FFF0',
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  goalLabel: {
    ...typography.h3,
    color: colors.text.primary,
  },
  goalLabelSelected: {
    color: colors.primary.main,
  },
  goalDesc: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  nextButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: colors.text.secondary,
  },
});
