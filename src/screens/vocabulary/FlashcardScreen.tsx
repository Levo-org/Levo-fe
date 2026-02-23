import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, FlashcardWord } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import { vocabularyService } from '../../services/vocabulary.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcard'>;
const { width } = Dimensions.get('window');

interface FlashcardData {
  cards: FlashcardWord[];
  total: number;
}

export default function FlashcardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const flip = useSharedValue(0);

  const fetcher = useCallback(() => vocabularyService.getFlashcards(30), []);
  const { data, loading } = useApi<FlashcardData>(fetcher);

  const cards = data?.cards ?? [];
  const card = cards[currentIndex];

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as any,
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as any,
  }));

  const toggleFlip = () => {
    flip.value = withTiming(isFlipped ? 0 : 1, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = useCallback(async (known: boolean) => {
    if (!card) return;
    // Record answer via API
    try {
      await vocabularyService.answerFlashcard(card._id, known);
    } catch { /* silently continue */ }

    if (known) setKnownCount((c) => c + 1);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      flip.value = withTiming(0, { duration: 200 });
      setIsFlipped(false);
    } else {
      navigation.replace('FlashcardComplete', {
        totalCards: cards.length,
        knownCards: known ? knownCount + 1 : knownCount,
      });
    }
  }, [currentIndex, knownCount, navigation, flip, card, cards.length]);

  if (loading || cards.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary.main} />
        ) : (
          <>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
            <Text style={{ ...typography.body, color: colors.text.secondary }}>플래시카드가 없습니다</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
              <Text style={{ ...typography.button, color: colors.primary.main }}>돌아가기</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={cards.length} height={6} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{cards.length}</Text>
      </View>

      <View style={styles.cardArea}>
        <TouchableOpacity onPress={toggleFlip} activeOpacity={0.95} style={styles.cardWrapper}>
          <Animated.View style={[styles.card, frontStyle]}>
            <Text style={styles.cardWord}>{card.word}</Text>
            <Text style={styles.tapHint}>탭하여 뒤집기</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <Text style={styles.cardMeaning}>{card.meaning}</Text>
            <Text style={styles.cardPronunciation}>{card.pronunciation}</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>예문</Text>
              <Text style={styles.exampleText}>{card.exampleSentence}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.wrongButton]}
          onPress={() => handleAnswer(false)}
          activeOpacity={0.8}
        >
          <Feather name="x" size={28} color={colors.status.error} />
          <Text style={[styles.actionText, { color: colors.status.error }]}>모르겠어요</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.correctButton]}
          onPress={() => handleAnswer(true)}
          activeOpacity={0.8}
        >
          <Feather name="check" size={28} color={colors.primary.main} />
          <Text style={[styles.actionText, { color: colors.primary.main }]}>알고있어요</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  progressWrapper: { flex: 1 },
  counter: { ...typography.small, color: colors.text.secondary, fontWeight: '600' },
  cardArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  cardWrapper: { width: width - 48, height: 320 },
  card: { position: 'absolute', width: '100%', height: '100%', backgroundColor: colors.background.secondary, borderRadius: 24, justifyContent: 'center', alignItems: 'center', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  cardBack: { backgroundColor: colors.primary.main },
  cardWord: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 12 },
  tapHint: { ...typography.small, color: colors.text.secondary },
  cardMeaning: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  cardPronunciation: { ...typography.body, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  exampleBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, width: '100%' },
  exampleLabel: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  exampleText: { ...typography.body, color: '#FFFFFF' },
  actions: { flexDirection: 'row', paddingHorizontal: 24, paddingBottom: 48, gap: 16 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, gap: 4 },
  wrongButton: { backgroundColor: '#FFEBEE' },
  correctButton: { backgroundColor: '#E8F7E0' },
  actionText: { ...typography.small, fontWeight: '700' },
});
