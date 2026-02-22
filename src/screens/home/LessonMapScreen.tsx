import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import TopBar from '../../components/TopBar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonMap'>;

const UNITS = [
  {
    id: 1,
    title: 'Unit 1: 기초',
    subtitle: '인사와 소개',
    lessons: [
      { id: '1-1', title: '인사하기', status: 'completed' as const, xp: 10 },
      { id: '1-2', title: '자기소개', status: 'completed' as const, xp: 10 },
      { id: '1-3', title: '숫자 익히기', status: 'current' as const, xp: 15 },
      { id: '1-4', title: '일상 표현', status: 'locked' as const, xp: 15 },
    ],
  },
  {
    id: 2,
    title: 'Unit 2: 일상',
    subtitle: '일상 생활과 쇼핑',
    lessons: [
      { id: '2-1', title: '쇼핑하기', status: 'locked' as const, xp: 20 },
      { id: '2-2', title: '음식 주문', status: 'locked' as const, xp: 20 },
      { id: '2-3', title: '길 찾기', status: 'locked' as const, xp: 20 },
    ],
  },
];

const statusColors = {
  completed: colors.primary.main,
  current: colors.accent.blue,
  locked: colors.background.tertiary,
};

export default function LessonMapScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <TopBar
        onHeartsPress={() => navigation.navigate('HeartsDemo')}
        onStreakPress={() => navigation.navigate('StreakDetail')}
        onCoinsPress={() => navigation.navigate('CoinShop')}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {UNITS.map((unit, unitIdx) => (
          <Animated.View key={unit.id} entering={FadeInDown.delay(unitIdx * 150).duration(500)} style={styles.unitSection}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>
            </View>

            <View style={styles.lessonsPath}>
              {unit.lessons.map((lesson, lessonIdx) => {
                const isLeft = lessonIdx % 2 === 0;
                return (
                  <View
                    key={lesson.id}
                    style={[styles.lessonRow, { justifyContent: isLeft ? 'flex-start' : 'flex-end' }]}
                  >
                    <TouchableOpacity
                      style={[styles.lessonNode, { backgroundColor: statusColors[lesson.status] }]}
                      onPress={() => {
                        if (lesson.status !== 'locked') {
                          navigation.navigate('LessonStart', { lessonId: lesson.id });
                        }
                      }}
                      disabled={lesson.status === 'locked'}
                      activeOpacity={0.7}
                    >
                      {lesson.status === 'completed' ? (
                        <Feather name="check" size={24} color="#FFFFFF" />
                      ) : lesson.status === 'current' ? (
                        <Feather name="play" size={24} color="#FFFFFF" />
                      ) : (
                        <Feather name="lock" size={20} color={colors.text.secondary} />
                      )}
                    </TouchableOpacity>
                    <Text style={[styles.lessonTitle, lesson.status === 'locked' && styles.lessonTitleLocked]}>
                      {lesson.title}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  unitSection: {
    marginBottom: 32,
  },
  unitHeader: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  unitTitle: {
    ...typography.h3,
    color: '#FFFFFF',
  },
  unitSubtitle: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  lessonsPath: {
    gap: 20,
    paddingHorizontal: 20,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  lessonTitleLocked: {
    color: colors.text.secondary,
  },
});
