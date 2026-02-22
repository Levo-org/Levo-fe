import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { id: 'vocabulary', emoji: '📝', title: '어휘 복습', count: 12, lastReview: '2시간 전', screen: 'VocabularyReview' as const, color: '#58CC02' },
  { id: 'grammar', emoji: '📖', title: '문법 복습', count: 5, lastReview: '1일 전', screen: 'GrammarReview' as const, color: '#1CB0F6' },
  { id: 'conversation', emoji: '💬', title: '회화 복습', count: 3, lastReview: '3일 전', screen: 'ConversationReview' as const, color: '#CE82FF' },
  { id: 'listening', emoji: '🎧', title: '듣기 복습', count: 4, lastReview: '2일 전', screen: 'ListeningReview' as const, color: '#FF9600' },
  { id: 'reading', emoji: '📚', title: '읽기 복습', count: 4, lastReview: '4일 전', screen: 'ReadingReview' as const, color: '#FF4B4B' },
];

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const totalItems = CATEGORIES.reduce((sum, c) => sum + c.count, 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>복습</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>📋</Text>
          <Text style={styles.summaryCount}>{totalItems}개</Text>
          <Text style={styles.summaryLabel}>복습이 필요한 항목</Text>
        </Animated.View>

        <View style={styles.categories}>
          {CATEGORIES.map((cat, index) => (
            <Animated.View key={cat.id} entering={FadeInDown.delay(100 + index * 80).duration(400)}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => navigation.navigate(cat.screen as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  <Text style={styles.categoryMeta}>{cat.count}개 · {cat.lastReview}</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: cat.color + '15' }]}>
                  <Text style={[styles.countText, { color: cat.color }]}>{cat.count}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <TouchableOpacity
            style={styles.quizButton}
            onPress={() => navigation.navigate('QuizReview')}
            activeOpacity={0.8}
          >
            <Feather name="edit" size={20} color="#FFFFFF" />
            <Text style={styles.quizButtonText}>퀴즈로 복습하기</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  summaryCard: { alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 20, padding: 24, marginBottom: 24, gap: 4 },
  summaryEmoji: { fontSize: 40, marginBottom: 4 },
  summaryCount: { fontSize: 32, fontWeight: '800', color: '#FF9600' },
  summaryLabel: { fontSize: 14, color: '#AFAFAF' },
  categories: { gap: 12, marginBottom: 24 },
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, gap: 12 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  categoryEmoji: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: '#4B4B4B' },
  categoryMeta: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
  countBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  countText: { fontSize: 14, fontWeight: '800' },
  quizButton: { flexDirection: 'row', backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  quizButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
