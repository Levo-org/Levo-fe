import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarDetail'>;

export default function GrammarDetailScreen({ navigation, route }: Props) {
  const { topicId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>현재 시제</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={18} color={colors.accent.blue} />
            <Text style={styles.sectionTitle}>설명</Text>
          </View>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationText}>
              현재 시제는 현재의 상태, 습관적인 행동, 일반적인 사실을 표현할 때 사용합니다.
            </Text>
            <View style={styles.ruleBox}>
              <Text style={styles.ruleTitle}>기본 규칙</Text>
              <Text style={styles.ruleText}>주어 + 동사 원형 (3인칭 단수: +s/es)</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="message-square" size={18} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>예문</Text>
          </View>
          {[
            { en: 'I study English every day.', ko: '나는 매일 영어를 공부합니다.' },
            { en: 'She plays the piano.', ko: '그녀는 피아노를 칩니다.' },
            { en: 'They live in Seoul.', ko: '그들은 서울에 삽니다.' },
          ].map((ex, idx) => (
            <View key={idx} style={styles.exampleCard}>
              <Text style={styles.exampleEn}>{ex.en}</Text>
              <Text style={styles.exampleKo}>{ex.ko}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={18} color={colors.accent.purple} />
            <Text style={styles.sectionTitle}>핵심 포인트</Text>
          </View>
          <View style={styles.pointsCard}>
            {['Be 동사: am, is, are', '3인칭 단수 -s/es 추가', '부정문: do/does + not + 원형', '의문문: Do/Does + 주어 + 원형?'].map((point, idx) => (
              <View key={idx} style={styles.pointRow}>
                <View style={styles.pointBullet} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.quizButton}
          onPress={() => navigation.navigate('GrammarQuiz', { topicId })}
          activeOpacity={0.8}
        >
          <Feather name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.quizButtonText}>퀴즈 풀기</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
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
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  explanationCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  explanationText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  ruleBox: {
    backgroundColor: '#EDF7FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
  },
  ruleTitle: {
    ...typography.small,
    color: colors.accent.blue,
    fontWeight: '700',
    marginBottom: 4,
  },
  ruleText: {
    ...typography.body,
    color: colors.text.primary,
  },
  exampleCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exampleEn: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  exampleKo: {
    ...typography.small,
    color: colors.text.secondary,
  },
  pointsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.purple,
  },
  pointText: {
    ...typography.body,
    color: colors.text.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: colors.background.primary,
  },
  quizButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  quizButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
