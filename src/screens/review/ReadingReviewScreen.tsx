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

type Props = NativeStackScreenProps<RootStackParamList, 'ReadingReview'>;

interface ReadingItem {
  _id: string;
  title: string;
  description?: string;
  difficulty?: string;
}

export default function ReadingReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const fetcher = useCallback(() => reviewService.getCategoryItems('reading'), []);
  const { data, loading } = useApi<ReadingItem[]>(fetcher);

  const items = data ?? [];

  const handleComplete = async () => {
    try { await reviewService.completeReview('reading'); } catch {}
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
        <Text style={styles.headerTitle}>읽기 복습</Text>
        <Text style={styles.headerCount}>{items.length}개</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📚</Text>
            <Text style={styles.emptyText}>복습할 읽기가 없습니다</Text>
          </View>
        ) : (
          items.map((item, idx) => (
            <Animated.View entering={FadeInDown.delay(idx * 60).duration(300)} key={item._id}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('ReadingPractice', { passageId: item._id })}
                activeOpacity={0.7}
              >
                <View style={styles.iconBox}>
                  <Feather name="book-open" size={22} color="#FF4B4B" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
                </View>
                {item.difficulty && (
                  <View style={styles.diffBadge}>
                    <Text style={styles.diffText}>{item.difficulty}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  cardDesc: { ...typography.small, color: colors.text.secondary },
  diffBadge: { backgroundColor: colors.background.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  diffText: { ...typography.small, color: colors.text.tertiary },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...typography.body, color: colors.text.secondary },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  completeBtn: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  completeBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
});
