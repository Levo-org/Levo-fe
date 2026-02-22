import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'VocabularyReview'>;

const REVIEW_WORDS = [
  { id: '1', word: 'Beautiful', meaning: '아름다운', revealed: false },
  { id: '2', word: 'Delicious', meaning: '맛있는', revealed: false },
  { id: '3', word: 'Interesting', meaning: '흥미로운', revealed: false },
  { id: '4', word: 'Difficult', meaning: '어려운', revealed: false },
  { id: '5', word: 'Important', meaning: '중요한', revealed: false },
];

export default function VocabularyReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [words, setWords] = useState(REVIEW_WORDS);
  const [completedCount, setCompletedCount] = useState(0);

  const toggleReveal = (id: string) => {
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, revealed: !w.revealed } : w)));
  };

  const markComplete = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
    setCompletedCount((c) => c + 1);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>어휘 복습</Text>
        <Text style={styles.countText}>{completedCount}/{REVIEW_WORDS.length}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {words.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>모든 단어를 복습했어요!</Text>
            <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          words.map((word, index) => (
            <Animated.View key={word.id} entering={FadeInDown.delay(index * 50).duration(300)}>
              <View style={styles.wordCard}>
                <TouchableOpacity style={styles.wordMain} onPress={() => toggleReveal(word.id)} activeOpacity={0.7}>
                  <Text style={styles.wordText}>{word.word}</Text>
                  {word.revealed ? (
                    <Text style={styles.meaningText}>{word.meaning}</Text>
                  ) : (
                    <Text style={styles.tapHint}>탭하여 뜻 보기</Text>
                  )}
                </TouchableOpacity>
                {word.revealed && (
                  <View style={styles.wordActions}>
                    <TouchableOpacity style={styles.wrongBtn} onPress={() => toggleReveal(word.id)} activeOpacity={0.7}>
                      <Feather name="x" size={18} color="#FF4B4B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.correctBtn} onPress={() => markComplete(word.id)} activeOpacity={0.7}>
                      <Feather name="check" size={18} color="#58CC02" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  countText: { fontSize: 14, fontWeight: '600', color: '#AFAFAF', width: 40, textAlign: 'right' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  wordCard: { backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, gap: 12 },
  wordMain: { gap: 4 },
  wordText: { fontSize: 20, fontWeight: '700', color: '#4B4B4B' },
  meaningText: { fontSize: 15, color: '#58CC02', fontWeight: '600' },
  tapHint: { fontSize: 13, color: '#AFAFAF' },
  wordActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  wrongBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center' },
  correctBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F7E0', justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#4B4B4B' },
  doneButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, marginTop: 16 },
  doneButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
