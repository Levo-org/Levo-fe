import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, GrammarTopic } from '../../types';
import BackButton from '../../components/BackButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import { grammarService } from '../../services/grammar.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const levelColors: Record<string, string> = {
  beginner: colors.primary.main,
  elementary: colors.accent.blue,
  intermediate: colors.accent.purple,
  advanced: '#FF9600',
  A1: colors.primary.main,
  A2: colors.accent.blue,
  B1: colors.accent.purple,
  B2: '#FF9600',
};

export default function GrammarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const fetcher = useCallback(() => grammarService.getTopics(), []);
  const { data: topics, loading } = useApi<GrammarTopic[]>(fetcher);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>문법</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {(topics ?? []).map((topic, index) => (
            <Animated.View key={topic._id} entering={FadeInDown.delay(index * 80).duration(400)}>
              <TouchableOpacity
                style={[styles.topicCard, topic.locked && styles.lockedCard]}
                onPress={() => !topic.locked && navigation.navigate('GrammarDetail', { topicId: topic._id })}
                activeOpacity={topic.locked ? 1 : 0.7}
              >
                <View style={styles.topicTop}>
                  <View style={[styles.levelBadge, { backgroundColor: (levelColors[topic.level] || colors.accent.blue) + '15' }]}>
                    <Text style={[styles.levelText, { color: levelColors[topic.level] || colors.accent.blue }]}>{topic.level}</Text>
                  </View>
                  {topic.status === 'completed' && <Feather name="check-circle" size={20} color={colors.primary.main} />}
                  {topic.locked && <Feather name="lock" size={18} color={colors.text.secondary} />}
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDesc}>{topic.subtitle}</Text>
                <View style={styles.topicProgress}>
                  <ProgressIndicator
                    current={topic.progress}
                    total={100}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  topicCard: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20 },
  lockedCard: { opacity: 0.5 },
  topicTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  levelText: { ...typography.caption, fontWeight: '800' },
  topicTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 4 },
  topicDesc: { ...typography.small, color: colors.text.secondary, marginBottom: 12 },
  topicProgress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topicProgressText: { ...typography.caption, color: colors.text.secondary, fontWeight: '600', width: 32, textAlign: 'right' },
});
