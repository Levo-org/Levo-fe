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

type Props = NativeStackScreenProps<RootStackParamList, 'VocabularyReview'>;

interface ReviewWord {
  _id: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
}

export default function VocabularyReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [reviewedCount, setReviewedCount] = useState(0);

  const fetcher = useCallback(() => reviewService.getCategoryItems('vocabulary'), []);
  const { data, loading } = useApi<ReviewWord[]>(fetcher);

  const words = data ?? [];

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        setReviewedCount(c => c + 1);
      }
      return next;
    });
  };

  const handleComplete = async () => {
    try {
      await reviewService.completeReview('vocabulary');
    } catch { /* ignore */ }
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
        <Text style={styles.headerTitle}>어휘 복습</Text>
        <Text style={styles.headerCount}>{words.length}개</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {words.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
            <Text style={styles.emptyText}>복습할 어휘가 없습니다</Text>
          </View>
        ) : (
          words.map((w, idx) => {
            const revealed = revealedIds.has(w._id);
            return (
              <Animated.View entering={FadeInDown.delay(idx * 60).duration(300)} key={w._id}>
                <TouchableOpacity style={styles.card} onPress={() => toggleReveal(w._id)} activeOpacity={0.7}>
                  <Text style={styles.word}>{w.word}</Text>
                  {w.pronunciation && <Text style={styles.pronunciation}>{w.pronunciation}</Text>}
                  {revealed ? (
                    <Animated.View entering={FadeIn.duration(200)}>
                      <Text style={styles.meaning}>{w.meaning}</Text>
                      {w.example && <Text style={styles.example}>{w.example}</Text>}
                    </Animated.View>
                  ) : (
                    <Text style={styles.tapHint}>탭하여 뜻 확인</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {words.length > 0 && (
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
  word: { ...typography.h3, color: colors.text.primary, marginBottom: 4 },
  pronunciation: { ...typography.small, color: colors.text.tertiary, marginBottom: 8 },
  meaning: { ...typography.body, color: colors.primary.main, fontWeight: '600', marginBottom: 4 },
  example: { ...typography.small, color: colors.text.secondary, fontStyle: 'italic' },
  tapHint: { ...typography.small, color: colors.text.tertiary },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...typography.body, color: colors.text.secondary },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  completeBtn: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  completeBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
});
