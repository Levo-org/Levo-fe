import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, FlashcardWord } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import { vocabularyService } from '../../services/vocabulary.service';
import { audioService } from '../../services/audio.service';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcard'>;
const { width } = Dimensions.get('window');

interface FlashcardData {
  cards: FlashcardWord[];
  total: number;
}

export default function FlashcardScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [wrongWordIds, setWrongWordIds] = useState<string[]>([]);
  const [pendingAnswers, setPendingAnswers] = useState<Array<{ wordId: string; correct: boolean }>>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPronouncing, setIsPronouncing] = useState(false);
  const flip = useSharedValue(0);
  const activeLanguage = useAuthStore((state) => state.user?.activeLanguage ?? state.languageProfile?.targetLanguage ?? 'en');

  const selectedChapter = route.params?.chapter;
  const retryWordIds = route.params?.wordIds;
  const isRetryMode = Array.isArray(retryWordIds) && retryWordIds.length > 0;
  const flashcardCount = isRetryMode ? retryWordIds.length : 30;
  const fetcher = useCallback(
    () => vocabularyService.getFlashcards(flashcardCount, {
      chapter: typeof selectedChapter === 'number' ? selectedChapter : undefined,
      wordIds: Array.isArray(retryWordIds) ? retryWordIds : undefined,
    }),
    [flashcardCount, selectedChapter, retryWordIds],
  );
  const { data, loading } = useApi<FlashcardData>(fetcher);

  const cards = data?.cards ?? [];
  const safeIndex = useMemo(
    () => (cards.length > 0 ? Math.min(currentIndex, cards.length - 1) : 0),
    [cards.length, currentIndex],
  );
  const card = cards[safeIndex] ?? null;

  const persistAnswers = useCallback(
    async (answers: Array<{ wordId: string; correct: boolean }>) => {
      if (answers.length === 0) return true;

      try {
        await vocabularyService.submitFlashcardAnswers(answers);
        setPendingAnswers([]);
        return true;
      } catch (err) {
        console.warn('[FlashcardScreen] Failed to save flashcard answers:', err);
        return false;
      }
    },
    [],
  );

  const handleExit = useCallback(async () => {
    if (isSaving || isCompleting) return;

    setIsSaving(true);
    const saved = await persistAnswers(pendingAnswers);
    setIsSaving(false);

    if (!saved) {
      Alert.alert('저장 실패', '진행한 학습 결과를 저장하지 못했습니다. 네트워크를 확인하고 다시 시도해주세요.');
      return;
    }

    navigation.goBack();
  }, [isSaving, isCompleting, pendingAnswers, persistAnswers, navigation]);

  useEffect(() => {
    if (!loading && cards.length > 0 && currentIndex >= cards.length && !isCompleting) {
      navigation.replace('FlashcardComplete', {
        totalCards: cards.length,
        knownCards: knownCount,
        wrongWordIds,
        chapter: selectedChapter,
      });
    }
  }, [loading, cards.length, currentIndex, knownCount, navigation, isCompleting, wrongWordIds, selectedChapter]);

  useEffect(() => {
    return () => {
      audioService.stop().catch(() => undefined);
    };
  }, []);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const toggleFlip = () => {
    flip.value = withTiming(isFlipped ? 0 : 1, { duration: 400 });
    setIsFlipped(!isFlipped);
  };

  const handlePlayPronunciation = useCallback(async () => {
    if (!card) return;

    if (isPronouncing) {
      await audioService.stop();
      setIsPronouncing(false);
      return;
    }

    setIsPronouncing(true);
    try {
      await audioService.speak(card.word, {
        language: activeLanguage,
        rate: 0.9,
        onDone: () => setIsPronouncing(false),
        onStopped: () => setIsPronouncing(false),
        onError: () => setIsPronouncing(false),
      });
    } catch {
      setIsPronouncing(false);
    }
  }, [card, isPronouncing, activeLanguage]);

  const handleAnswer = useCallback(async (known: boolean) => {
    if (!card || isCompleting) return;

    if (isPronouncing) {
      await audioService.stop();
      setIsPronouncing(false);
    }

    const nextPendingAnswers = [...pendingAnswers, { wordId: card._id, correct: known }];
    setPendingAnswers(nextPendingAnswers);

    if (known) setKnownCount((c) => c + 1);
    const nextWrongWordIds = known
      ? wrongWordIds
      : (wrongWordIds.includes(card._id) ? wrongWordIds : [...wrongWordIds, card._id]);

    if (!known) {
      setWrongWordIds(nextWrongWordIds);
    }

    if (safeIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
      flip.value = withTiming(0, { duration: 200 });
      setIsFlipped(false);
    } else {
      setIsCompleting(true);

      const saved = await persistAnswers(nextPendingAnswers);
      if (!saved) {
        setIsCompleting(false);
        Alert.alert('저장 실패', '학습 완료 저장에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      navigation.replace('FlashcardComplete', {
        totalCards: cards.length,
        knownCards: known ? knownCount + 1 : knownCount,
        wrongWordIds: nextWrongWordIds,
        chapter: selectedChapter,
      });
    }
  }, [knownCount, navigation, flip, card, cards.length, safeIndex, isCompleting, wrongWordIds, selectedChapter, pendingAnswers, persistAnswers, isPronouncing]);

  if (loading || isCompleting || isSaving) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (cards.length === 0 || !card) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
        <Text style={{ ...typography.body, color: colors.text.secondary }}>플래시카드가 없습니다</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
          <Text style={{ ...typography.button, color: colors.primary.main }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleExit} activeOpacity={0.7}>
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
            <TouchableOpacity style={styles.pronounceButton} onPress={handlePlayPronunciation} activeOpacity={0.8}>
              <Feather name={isPronouncing ? 'pause-circle' : 'volume-2'} size={24} color={colors.primary.main} />
            </TouchableOpacity>
            <Text style={styles.cardWord}>{card.word}</Text>
            <Text style={styles.tapHint}>탭하여 뒤집기</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
            <TouchableOpacity style={styles.pronounceButtonBack} onPress={handlePlayPronunciation} activeOpacity={0.8}>
              <Feather name={isPronouncing ? 'pause-circle' : 'volume-2'} size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
  pronounceButton: { position: 'absolute', top: 16, right: 16 },
  pronounceButtonBack: { position: 'absolute', top: 16, right: 16 },
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
