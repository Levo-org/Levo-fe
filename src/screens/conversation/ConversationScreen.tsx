import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, ConversationSituation } from '../../types';
import BackButton from '../../components/BackButton';
import { conversationService } from '../../services/conversation.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const difficultyColors: Record<string, string> = {
  beginner: colors.primary.main,
  elementary: colors.primary.main,
  intermediate: colors.accent.blue,
  advanced: colors.accent.purple,
  '초급': colors.primary.main,
  '중급': colors.accent.blue,
  '고급': colors.accent.purple,
};

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const fetcher = useCallback(() => conversationService.getSituations(), []);
  const { data: situations, loading } = useApi<ConversationSituation[]>(fetcher);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>회화</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {(situations ?? []).map((sit, index) => (
            <Animated.View key={sit._id} entering={FadeInDown.delay(index * 80).duration(400)}>
              <TouchableOpacity
                style={[styles.card, sit.locked && styles.lockedCard]}
                onPress={() => !sit.locked && navigation.navigate('ConversationDialog', { situationId: sit._id })}
                activeOpacity={sit.locked ? 1 : 0.7}
              >
                <Text style={styles.cardEmoji}>{sit.emoji}</Text>
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle}>{sit.title}</Text>
                    {sit.completed && <Feather name="check-circle" size={18} color={colors.primary.main} />}
                    {sit.locked && <Feather name="lock" size={16} color={colors.text.secondary} />}
                  </View>
                  <View style={[styles.diffBadge, { backgroundColor: (difficultyColors[sit.level] || colors.accent.blue) + '15' }]}>
                    <Text style={[styles.diffText, { color: difficultyColors[sit.level] || colors.accent.blue }]}>{sit.level}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.text.secondary} />
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, gap: 12 },
  lockedCard: { opacity: 0.5 },
  cardEmoji: { fontSize: 40 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { ...typography.body, fontWeight: '700', color: colors.text.primary },
  diffBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, marginTop: 6 },
  diffText: { ...typography.caption, fontWeight: '700' },
});
