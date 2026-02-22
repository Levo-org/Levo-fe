import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['전체', '학습중', '완료', '틀린단어'];

const MOCK_WORDS = [
  { id: '1', word: 'Hello', pronunciation: '/həˈloʊ/', meaning: '안녕하세요', status: 'learning' },
  { id: '2', word: 'Thank you', pronunciation: '/θæŋk juː/', meaning: '감사합니다', status: 'completed' },
  { id: '3', word: 'Goodbye', pronunciation: '/ɡʊdˈbaɪ/', meaning: '안녕히 가세요', status: 'learning' },
  { id: '4', word: 'Please', pronunciation: '/pliːz/', meaning: '제발, 부탁합니다', status: 'wrong' },
  { id: '5', word: 'Sorry', pronunciation: '/ˈsɑːri/', meaning: '죄송합니다', status: 'completed' },
  { id: '6', word: 'Good morning', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/', meaning: '좋은 아침', status: 'learning' },
  { id: '7', word: 'Good night', pronunciation: '/ɡʊd naɪt/', meaning: '좋은 밤, 안녕히 주무세요', status: 'new' },
  { id: '8', word: 'Excuse me', pronunciation: '/ɪkˈskjuːz mi/', meaning: '실례합니다', status: 'new' },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: '새 단어', color: colors.accent.blue, bg: '#EDF7FF' },
  learning: { label: '학습중', color: '#FF9600', bg: '#FFF3E0' },
  completed: { label: '완료', color: colors.primary.main, bg: '#E8F7E0' },
  wrong: { label: '틀림', color: colors.status.error, bg: '#FFEBEE' },
};

export default function VocabularyScreen() {
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState(0);

  const filteredWords = activeTab === 0
    ? MOCK_WORDS
    : MOCK_WORDS.filter((w) => {
        if (activeTab === 1) return w.status === 'learning';
        if (activeTab === 2) return w.status === 'completed';
        return w.status === 'wrong';
      });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const config = statusConfig[item.status] || statusConfig.new;
          return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
              <TouchableOpacity style={styles.wordCard} activeOpacity={0.7}>
                <View style={styles.wordLeft}>
                  <Text style={styles.wordText}>{item.word}</Text>
                  <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
                  <Text style={styles.meaningText}>{item.meaning}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Flashcard')}
        activeOpacity={0.8}
      >
        <Feather name="layers" size={20} color="#FFFFFF" />
        <Text style={styles.fabText}>플래시카드 시작</Text>
      </TouchableOpacity>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
  },
  tabActive: {
    backgroundColor: colors.primary.main,
  },
  tabText: {
    ...typography.small,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 8,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  wordLeft: {
    flex: 1,
  },
  wordText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  pronunciationText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  meaningText: {
    ...typography.small,
    color: colors.text.primary,
    marginTop: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
