import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'LevelSelect'>;

const LEVELS = [
  { id: 'beginner', emoji: '🌱', name: '완전 초보', desc: '처음 시작해요' },
  { id: 'elementary', emoji: '📗', name: '기초', desc: '간단한 인사 정도는 할 수 있어요' },
  { id: 'intermediate', emoji: '📘', name: '중급', desc: '일상 대화가 가능해요' },
  { id: 'advanced', emoji: '📙', name: '고급', desc: '복잡한 주제도 다룰 수 있어요' },
];

export default function LevelSelectScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { setLevel } = useOnboardingStore();

  const handleNext = () => {
    if (selected) {
      setLevel(selected);
      navigation.navigate('GoalSetting');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          현재 실력은{'\n'}어느 정도인가요?
        </Animated.Text>

        <View style={styles.options}>
          {LEVELS.map((level, index) => (
            <Animated.View key={level.id} entering={FadeInDown.delay(200 + index * 100).duration(500)}>
              <TouchableOpacity
                style={[
                  styles.card,
                  selected === level.id && styles.cardSelected,
                ]}
                onPress={() => setSelected(level.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{level.emoji}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.levelName, selected === level.id && styles.levelNameSelected]}>
                    {level.name}
                  </Text>
                  <Text style={styles.levelDesc}>{level.desc}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, !selected && styles.nextButtonTextDisabled]}>
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
  levelName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  levelNameSelected: {
    color: colors.primary.main,
  },
  levelDesc: {
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
