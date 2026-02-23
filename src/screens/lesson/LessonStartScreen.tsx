import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { lessonService } from '../../services/lesson.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonStart'>;

interface LessonDetail {
  _id: string;
  name: string;
  description: string;
  objectives: string[];
  estimatedMinutes: number;
  xpReward: number;
  questions: any[];
}

export default function LessonStartScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { lessonId } = route.params;

  const fetcher = useCallback(() => lessonService.getLessonDetail(lessonId), [lessonId]);
  const { data, loading } = useApi<LessonDetail>(fetcher);

  const handleStart = async () => {
    try {
      await lessonService.startLesson(lessonId);
    } catch { /* continue anyway */ }
    navigation.navigate('LessonQuiz', { lessonId });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  const lesson = data;

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
          {lesson?.name ?? '레슨'}
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subtitle}>
          {lesson?.description ?? ''}
        </Animated.Text>

        {(lesson?.objectives?.length ?? 0) > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.objectives}>
            <Text style={styles.objectivesTitle}>학습 목표</Text>
            {lesson!.objectives.map((obj, idx) => (
              <View key={idx} style={styles.objectiveRow}>
                <Feather name="check-circle" size={16} color={colors.primary.main} />
                <Text style={styles.objectiveText}>{obj}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={16} color={colors.text.secondary} />
            <Text style={styles.infoText}>약 {lesson?.estimatedMinutes ?? 5}분</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoEmoji}>⭐</Text>
            <Text style={styles.infoText}>+{lesson?.xpReward ?? 15} XP</Text>
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
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  content: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  iconArea: { marginBottom: 24, marginTop: 20 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FFF0', justifyContent: 'center', alignItems: 'center' },
  iconEmoji: { fontSize: 48 },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginBottom: 32 },
  objectives: { width: '100%', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, gap: 12, marginBottom: 24 },
  objectivesTitle: { ...typography.h4, color: colors.text.primary, marginBottom: 4 },
  objectiveRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  objectiveText: { ...typography.body, color: colors.text.primary },
  infoRow: { flexDirection: 'row', gap: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoEmoji: { fontSize: 14 },
  infoText: { ...typography.small, color: colors.text.secondary },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  startButton: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  startButtonText: { ...typography.button, color: '#FFFFFF', fontSize: 18 },
});
