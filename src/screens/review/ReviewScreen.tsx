import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { reviewService } from '../../services/review.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

interface ReviewDashboard {
  totalReviewItems: number;
  categories: {
    id?: string;
    category?: string;
    name?: string;
    count: number;
    lastReview?: string;
  }[];
}

const CATEGORY_META: Record<string, { emoji: string; title: string; screen: string; color: string }> = {
  vocabulary: { emoji: '📝', title: '어휘 복습', screen: 'VocabularyReview', color: '#58CC02' },
  grammar: { emoji: '📖', title: '문법 복습', screen: 'GrammarReview', color: '#1CB0F6' },
  conversation: { emoji: '💬', title: '회화 복습', screen: 'ConversationReview', color: '#CE82FF' },
  listening: { emoji: '🎧', title: '듣기 복습', screen: 'ListeningReview', color: '#FF9600' },
  reading: { emoji: '📚', title: '읽기 복습', screen: 'ReadingReview', color: '#FF4B4B' },
};

export default function ReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const fetcher = useCallback(() => reviewService.getDashboard(), []);
  const { data, loading, refetch } = useApi<ReviewDashboard>(fetcher);

  const categories = data?.categories ?? [];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>복습</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>복습할 항목</Text>
            <Text style={styles.summaryCount}>{data?.totalReviewItems ?? 0}개</Text>
          </Animated.View>

          {/* Categories */}
          <Text style={styles.sectionTitle}>카테고리별 복습</Text>
          {categories.length > 0 ? categories.map((cat, idx) => {
            const key = cat.category ?? cat.id ?? cat.name ?? '';
            const meta = CATEGORY_META[key] ?? {
              emoji: '📋',
              title: cat.category,
              screen: 'VocabularyReview',
              color: colors.primary.main,
            };
            return (
              <Animated.View entering={FadeInDown.delay(idx * 80).duration(400)} key={key}>
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate(meta.screen as any, { category: key })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: meta.color + '20' }]}>
                    <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{meta.title}</Text>
                    <Text style={styles.categoryMeta}>
                      {cat.count}개 · {cat.lastReview ? `마지막: ${cat.lastReview}` : '아직 없음'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </Animated.View>
            );
          }) : (
            /* Fallback: show all categories */
            Object.entries(CATEGORY_META).map(([key, meta], idx) => (
              <Animated.View entering={FadeInDown.delay(idx * 80).duration(400)} key={key}>
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => navigation.navigate(meta.screen as any, { category: key })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: meta.color + '20' }]}>
                    <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryTitle}>{meta.title}</Text>
                    <Text style={styles.categoryMeta}>0개</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryCard: { backgroundColor: colors.primary.main, borderRadius: 20, padding: 24, marginBottom: 24, alignItems: 'center' },
  summaryTitle: { ...typography.body, color: '#FFFFFF', opacity: 0.9, marginBottom: 4 },
  summaryCount: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: 12 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, gap: 14 },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 22 },
  categoryInfo: { flex: 1 },
  categoryTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  categoryMeta: { ...typography.small, color: colors.text.secondary },
});
