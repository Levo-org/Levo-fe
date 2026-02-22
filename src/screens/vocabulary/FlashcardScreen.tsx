import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, interpolate } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcard'>;

const { width } = Dimensions.get('window');

const MOCK_CARDS = [
  { id: '1', word: 'Hello', pronunciation: '/həˈloʊ/', meaning: '안녕하세요', example: 'Hello, how are you?' },
  { id: '2', word: 'Thank you', pronunciation: '/θæŋk juː/', meaning: '감사합니다', example: 'Thank you very much!' },
  { id: '3', word: 'Goodbye', pronunciation: '/ɡʊdˈbaɪ/', meaning: '안녕히 가세요', example: 'Goodbye, see you tomorrow.' },
  { id: '4', word: 'Please', pronunciation: '/pliːz/', meaning: '제발, 부탁합니다', example: 'Please help me.' },
  { id: '5', word: 'Sorry', pronunciation: '/ˈsɑːri/', meaning: '죄송합니다', example: 'I am sorry.' },
];

export default function FlashcardScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const flip = useSharedValue(0);

  const card = MOCK_CARDS[currentIndex];

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

  const handleAnswer = useCallback((known: boolean) => {
    if (known) setKnownCount((c) => c + 1);
    if (currentIndex < MOCK_CARDS.length - 1) {
      setCurrentIndex((i) => i + 1);
      flip.value = withTiming(0, { duration: 200 });
      setIsFlipped(false);
    } else {
      navigation.replace('FlashcardComplete', {
        totalCards: MOCK_CARDS.length,
        knownCards: known ? knownCount + 1 : knownCount,
      });
    }
  }, [currentIndex, knownCount, navigation, flip]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={MOCK_CARDS.length} height={6} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{MOCK_CARDS.length}</Text>
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
              <Text style={styles.exampleText}>{card.example}</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  progressWrapper: {
    flex: 1,
  },
  counter: {
    ...typography.small,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: width - 48,
    height: 320,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardBack: {
    backgroundColor: colors.primary.main,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 12,
  },
  tapHint: {
    ...typography.small,
    color: colors.text.secondary,
  },
  cardMeaning: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardPronunciation: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  exampleLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  exampleText: {
    ...typography.body,
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 4,
  },
  wrongButton: {
    backgroundColor: '#FFEBEE',
  },
  correctButton: {
    backgroundColor: '#E8F7E0',
  },
  actionText: {
    ...typography.small,
    fontWeight: '700',
  },
});
