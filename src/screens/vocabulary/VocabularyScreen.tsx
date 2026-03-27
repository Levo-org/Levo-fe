import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, ScrollView, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, Word } from '../../types';
import BackButton from '../../components/BackButton';
import { vocabularyService } from '../../services/vocabulary.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['전체', '학습중', '완료'];
const TAB_STATUS = ['all', 'learning', 'completed'] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '새 단어', color: colors.accent.blue, bg: '#EDF7FF' },
  learning: { label: '학습중', color: '#FF9600', bg: '#FFF3E0' },
  completed: { label: '완료', color: colors.primary.main, bg: '#E8F7E0' },
  wrong: { label: '틀림', color: colors.status.error, bg: '#FFEBEE' },
};

interface VocabData {
  words: Word[];
  tabs: { all: number; learning: number; completed: number; wrong: number };
}

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState(0);
  const [activeChapter, setActiveChapter] = useState<number | null>(null);
  const [isChapterModalVisible, setIsChapterModalVisible] = useState(false);

  const fetcher = useCallback(
    () => vocabularyService.getWords({ status: TAB_STATUS[activeTab] }),
    [activeTab],
  );
  const { data, loading, refetch } = useApi<VocabData>(fetcher);

  React.useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const words = data?.words ?? [];
  const filteredWords = useMemo(
    () => (activeChapter === null ? words : words.filter((word) => word.chapter === activeChapter)),
    [words, activeChapter],
  );
  const tabCounts = data?.tabs;
  const chapters = useMemo(
    () => Array.from(new Set(words.map((word) => word.chapter).filter((chapter) => chapter > 0))).sort((a, b) => a - b),
    [words],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>어휘</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
              {tab}
              {tabCounts ? ` ${idx === 0 ? tabCounts.all : idx === 1 ? tabCounts.learning : tabCounts.completed}` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(chapters.length > 0 || activeChapter !== null) && (
        <View style={styles.chapterSection}>
          <Text style={styles.chapterLabel}>단계(Chapter)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterList}>
            <TouchableOpacity
              style={[styles.chapterChip, activeChapter === null && styles.chapterChipActive]}
              onPress={() => setActiveChapter(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chapterChipText, activeChapter === null && styles.chapterChipTextActive]}>전체</Text>
            </TouchableOpacity>
            {chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter}
                style={[styles.chapterChip, activeChapter === chapter && styles.chapterChipActive]}
                onPress={() => setActiveChapter(chapter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chapterChipText, activeChapter === chapter && styles.chapterChipTextActive]}>
                  Chapter {chapter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      ) : (
        <FlatList
          data={filteredWords}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>단어가 없습니다</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const config = statusConfig[item.status] || statusConfig.new;
            return (
              <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
                <TouchableOpacity style={styles.wordCard} activeOpacity={0.7}>
                  <View style={styles.wordLeft}>
                    <Text style={styles.wordText}>{item.word}</Text>
                    <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
                    <Text style={styles.meaningText}>{item.meaning}</Text>
                    {item.chapter > 0 && <Text style={styles.chapterText}>Chapter {item.chapter}</Text>}
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}> 
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsChapterModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="layers" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>플래시카드 시작</Text>
      </TouchableOpacity>

      <Modal
        visible={isChapterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChapterModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setIsChapterModalVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>챕터 선택</Text>
            {chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter}
                style={styles.modalOption}
                onPress={() => {
                  setActiveChapter(chapter);
                  setIsChapterModalVisible(false);
                  navigation.navigate('Flashcard', { chapter });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalOptionText}>Chapter {chapter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { ...typography.h2, color: colors.text.primary },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  chapterSection: { marginBottom: 12 },
  chapterLabel: { ...typography.caption, color: colors.text.secondary, paddingHorizontal: 20, marginBottom: 8, fontWeight: '700' },
  chapterList: { paddingHorizontal: 20, gap: 8 },
  chapterChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.background.secondary },
  chapterChipActive: { backgroundColor: colors.primary.main },
  chapterChipText: { ...typography.caption, color: colors.text.secondary, fontWeight: '700' },
  chapterChipTextActive: { color: '#FFFFFF' },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.background.secondary },
  tabActive: { backgroundColor: colors.primary.main },
  tabText: { ...typography.small, color: colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { ...typography.body, color: colors.text.secondary },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 8 },
  wordCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background.secondary, borderRadius: 12, padding: 16 },
  wordLeft: { flex: 1 },
  wordText: { ...typography.body, fontWeight: '700', color: colors.text.primary },
  pronunciationText: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  meaningText: { ...typography.small, color: colors.text.primary, marginTop: 4 },
  chapterText: { ...typography.caption, color: colors.text.tertiary, marginTop: 6, fontWeight: '600' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  statusText: { ...typography.caption, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 32, left: 20, right: 20, flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: colors.primary.main, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  fabText: { ...typography.button, color: '#FFFFFF' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.background.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 10 },
  modalTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 6 },
  modalOption: { backgroundColor: colors.background.secondary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14 },
  modalOptionText: { ...typography.body, color: colors.text.primary, fontWeight: '700' },
});
