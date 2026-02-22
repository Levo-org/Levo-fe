import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_TOPICS = [
  { id: '1', title: '현재 시제', desc: 'Be 동사와 일반 동사의 현재형', level: 'A1', progress: 80, total: 100, completed: true },
  { id: '2', title: '과거 시제', desc: '규칙/불규칙 과거형 변화', level: 'A1', progress: 60, total: 100, completed: false },
  { id: '3', title: '미래 시제', desc: 'will과 be going to 사용법', level: 'A2', progress: 30, total: 100, completed: false },
  { id: '4', title: '현재 완료', desc: 'have + p.p 구문', level: 'A2', progress: 0, total: 100, completed: false },
  { id: '5', title: '조건문', desc: 'if 조건절 사용법', level: 'B1', progress: 0, total: 100, completed: false },
];

const levelColors: Record<string, string> = {
  A1: colors.primary.main,
  A2: colors.accent.blue,
  B1: colors.accent.purple,
  B2: '#FF9600',
};

export default function GrammarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>문법</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {MOCK_TOPICS.map((topic, index) => (
          <Animated.View key={topic.id} entering={FadeInDown.delay(index * 80).duration(400)}>
            <TouchableOpacity
              style={styles.topicCard}
              onPress={() => navigation.navigate('GrammarDetail', { topicId: topic.id })}
              activeOpacity={0.7}
            >
              <View style={styles.topicTop}>
                <View style={[styles.levelBadge, { backgroundColor: (levelColors[topic.level] || colors.accent.blue) + '15' }]}>
                  <Text style={[styles.levelText, { color: levelColors[topic.level] || colors.accent.blue }]}>{topic.level}</Text>
                </View>
                {topic.completed && (
                  <Feather name="check-circle" size={20} color={colors.primary.main} />
                )}
              </View>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDesc}>{topic.desc}</Text>
              <View style={styles.topicProgress}>
                <ProgressIndicator
                  current={topic.progress}
                  total={topic.total}
                  height={4}
                  color={levelColors[topic.level] || colors.accent.blue}
                />
                <Text style={styles.topicProgressText}>{topic.progress}%</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  topicCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
  },
  topicTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  levelText: {
    ...typography.caption,
    fontWeight: '800',
  },
  topicTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  topicDesc: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  topicProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicProgressText: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },
});
