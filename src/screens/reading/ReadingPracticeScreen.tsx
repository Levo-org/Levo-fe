import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ReadingPracticePassage } from '../../types';
import BackButton from '../../components/BackButton';
import QuizOption from '../../components/QuizOption';
import { readingService } from '../../services/reading.service';
import { audioService } from '../../services/audio.service';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ReadingPractice'>;

const LABELS = ['A', 'B', 'C', 'D'];

export default function ReadingPracticeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const requestedPassageId = route.params?.passageId;
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selectedPassageIdx, setSelectedPassageIdx] = useState(0);
  const [serverCorrectIdx, setServerCorrectIdx] = useState<number | null>(null);
  const [isReadingAudioPlaying, setIsReadingAudioPlaying] = useState(false);
  const initializedWithRouteParam = useRef(false);
  const activeLanguage = useAuthStore((state) => state.user?.activeLanguage ?? state.languageProfile?.targetLanguage ?? 'en');
  const level = useAuthStore((state) => state.languageProfile?.level);

  const fetcher = useCallback(
    () => readingService.getPassages({ targetLanguage: activeLanguage, difficulty: level }),
    [activeLanguage, level],
  );
  const { data: passages, loading, refetch } = useApi<ReadingPracticePassage[]>(fetcher);

  const allPassages = passages ?? [];
  const passage = allPassages[selectedPassageIdx];
  const questions = passage?.questions ?? [];
  const question = questions[currentQ];

  useEffect(() => {
    if (initializedWithRouteParam.current) return;
    if (!requestedPassageId) {
      initializedWithRouteParam.current = true;
      return;
    }
    if (allPassages.length === 0) return;

    const targetIndex = allPassages.findIndex((item) => item._id === requestedPassageId);
    if (targetIndex >= 0) {
      setSelectedPassageIdx(targetIndex);
    }
    initializedWithRouteParam.current = true;
  }, [allPassages, requestedPassageId]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    return () => {
      audioService.stop().catch(() => undefined);
    };
  }, []);

  const handlePlayReadingAudio = useCallback(async () => {
    if (!passage) return;

    if (isReadingAudioPlaying) {
      await audioService.stop();
      setIsReadingAudioPlaying(false);
      return;
    }

    const speechText = showTranslation && passage.translation ? passage.translation : passage.text;
    const speechLanguage = showTranslation ? 'ko' : activeLanguage;

    setIsReadingAudioPlaying(true);
    try {
      await audioService.speak(speechText, {
        language: speechLanguage,
        rate: 0.9,
        onDone: () => setIsReadingAudioPlaying(false),
        onStopped: () => setIsReadingAudioPlaying(false),
        onError: () => setIsReadingAudioPlaying(false),
      });
    } catch {
      setIsReadingAudioPlaying(false);
    }
  }, [passage, isReadingAudioPlaying, showTranslation, activeLanguage]);

  const handleSelect = useCallback(async (index: number) => {
    if (answered || !passage || !question) return;
    setSelectedAnswer(index);
    setAnswered(true);

    try {
      const res = await readingService.answerQuiz(passage._id, currentQ, index);
      const result = res.data?.data;
      if (result?.correctAnswer !== undefined) {
        const parsedCorrect = typeof result.correctAnswer === 'number'
          ? result.correctAnswer
          : Number.parseInt(result.correctAnswer, 10);
        setServerCorrectIdx(Number.isNaN(parsedCorrect) ? null : parsedCorrect);
      }
    } catch {
      setServerCorrectIdx(null);
    }
  }, [answered, passage, question, currentQ]);

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setServerCorrectIdx(null);
    } else if (selectedPassageIdx < allPassages.length - 1) {
      audioService.stop().catch(() => undefined);
      setIsReadingAudioPlaying(false);
      setSelectedPassageIdx((i) => i + 1);
      setCurrentQ(0);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowTranslation(false);
      setServerCorrectIdx(null);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    const correctIdx = serverCorrectIdx ?? question?.correctIndex;
    if (index === correctIdx) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!passage) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📚</Text>
        <Text style={{ ...typography.body, color: colors.text.secondary }}>읽기 지문이 없습니다</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24 }}>
          <Text style={{ ...typography.button, color: colors.primary.main }}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>읽기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.passageCard}>
          <Text style={styles.passageTitle}>{passage.title}</Text>
          <Text style={styles.passageText}>{showTranslation ? passage.translation : passage.text}</Text>
          <View style={styles.passageActions}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowTranslation(!showTranslation)}
              activeOpacity={0.7}
            >
              <Feather name="globe" size={16} color={colors.accent.blue} />
              <Text style={styles.toggleText}>{showTranslation ? '원문 보기' : '번역 보기'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.listenButton, isReadingAudioPlaying && styles.listenButtonActive]}
              onPress={handlePlayReadingAudio}
              activeOpacity={0.8}
            >
              <Feather name={isReadingAudioPlaying ? 'pause' : 'volume-2'} size={16} color={isReadingAudioPlaying ? '#FFFFFF' : colors.primary.main} />
              <Text style={[styles.listenButtonText, isReadingAudioPlaying && styles.listenButtonTextActive]}>
                {isReadingAudioPlaying ? '정지' : '듣기'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {question && (
          <View style={styles.quizSection}>
            <Text style={styles.quizTitle}>문제 {currentQ + 1}/{questions.length}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.options}>
              {question.options.map((option, idx) => (
                <QuizOption
                  key={idx}
                  label={LABELS[idx]}
                  text={option}
                  state={getOptionState(idx)}
                  onPress={() => handleSelect(idx)}
                  disabled={answered}
                />
              ))}
            </View>
          </View>
        )}

        {answered && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.nextArea}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>
                {currentQ < questions.length - 1 ? '다음 문제' : selectedPassageIdx < allPassages.length - 1 ? '다음 지문' : '완료'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  passageCard: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, marginBottom: 24 },
  passageTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B', marginBottom: 12 },
  passageText: { fontSize: 15, color: '#4B4B4B', lineHeight: 24 },
  passageActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EDF7FF' },
  toggleText: { fontSize: 13, color: '#1CB0F6', fontWeight: '600' },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E8F7E0',
  },
  listenButtonActive: {
    backgroundColor: colors.primary.main,
  },
  listenButtonText: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '600',
  },
  listenButtonTextActive: {
    color: '#FFFFFF',
  },
  quizSection: { marginBottom: 24 },
  quizTitle: { fontSize: 13, color: '#AFAFAF', marginBottom: 8 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#4B4B4B', marginBottom: 16 },
  options: { gap: 12 },
  nextArea: { paddingBottom: 12 },
  nextButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
