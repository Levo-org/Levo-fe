import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonStart'>;

export default function LessonStartScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { lessonId } = route.params;

  const handleStart = () => {
    navigation.navigate('LessonQuiz', { lessonId });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.iconArea}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>📚</Text>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.title}>
          레슨: 인사하기
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subtitle}>
          기본 인사 표현을 배워보세요
        </Animated.Text>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.objectives}>
          <Text style={styles.objectivesTitle}>학습 목표</Text>
          {['기본 인사 표현 5가지', '상황별 인사 구분하기', '발음 연습하기'].map((obj, idx) => (
            <View key={idx} style={styles.objectiveRow}>
              <Feather name="check-circle" size={16} color={colors.primary.main} />
              <Text style={styles.objectiveText}>{obj}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>약 5분</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>⭐</Text>
            <Text style={styles.infoText}>+15 XP</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="heart" size={16} color={colors.status.error} />
            <Text style={styles.infoText}>하트 1개 사용</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.8}>
          <Text style={styles.startButtonText}>학습 시작</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconArea: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FFF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  objectives: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginBottom: 24,
  },
  objectivesTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  objectiveText: {
    ...typography.body,
    color: colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoEmoji: {
    fontSize: 14,
  },
  infoText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
