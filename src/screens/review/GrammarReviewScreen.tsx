import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { reviewService } from '../../services/review.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarReview'>;

interface GrammarItem {
  _id: string;
  rule: string;
  example: string;
  tip?: string;
  formula?: string;
}

export default function GrammarReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetcher = useCallback(() => reviewService.getCategoryItems('grammar'), []);
  const { data, loading } = useApi<GrammarItem[]>(fetcher);

  const items = data ?? [];

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleComplete = async () => {
    try { await reviewService.completeReview('grammar'); } catch {}
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>문법 복습</Text>
        <Text style={styles.headerCount}>{items.length}개</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📖</Text>
            <Text style={styles.emptyText}>복습할 문법이 없습니다</Text>
          </View>
        ) : (
          items.map((item, idx) => {
            const expanded = expandedIds.has(item._id);
            return (
              <Animated.View entering={FadeInDown.delay(idx * 60).duration(300)} key={item._id}>
                <TouchableOpacity style={styles.card} onPress={() => toggle(item._id)} activeOpacity={0.7}>
                  <Text style={styles.rule}>{item.rule}</Text>
                  {item.formula && <Text style={styles.formula}>{item.formula}</Text>}
                  <Text style={styles.example}>예: {item.example}</Text>
                  {expanded && item.tip ? (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 {item.tip}</Text>
                    </Animated.View>
                  ) : !expanded ? (
                    <Text style={styles.tapHint}>탭하여 팁 보기</Text>
                  ) : null}
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.8}>
            <Text style={styles.completeBtnText}>복습 완료</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  headerCount: { ...typography.caption, color: colors.text.secondary },
  content: { paddingHorizontal: 20, paddingBottom: 100 },
  card: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, marginBottom: 12 },
  rule: { ...typography.h3, color: colors.text.primary, marginBottom: 6 },
  formula: { ...typography.small, color: colors.primary.main, fontWeight: '600', marginBottom: 6 },
  example: { ...typography.body, color: colors.text.secondary, fontStyle: 'italic', marginBottom: 8 },
  tipBox: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginTop: 4 },
  tipText: { ...typography.small, color: '#92400E' },
  tapHint: { ...typography.small, color: colors.text.tertiary },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...typography.body, color: colors.text.secondary },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  completeBtn: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  completeBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
});
