import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ListeningPracticeItem } from '../../types';
import BackButton from '../../components/BackButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { listeningService } from '../../services/listening.service';
import { audioService } from '../../services/audio.service';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ListeningPractice'>;

const LABELS = ['A', 'B', 'C', 'D'];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export default function ListeningPracticeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const requestedProblemId = route.params?.problemId;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [serverCorrectIdx, setServerCorrectIdx] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const activeLanguage = useAuthStore(
    (state) => state.user?.activeLanguage ?? state.languageProfile?.targetLanguage ?? 'en',
  );
  const initializedWithRouteParam = useRef(false);
  const level = useAuthStore((state) => state.languageProfile?.level);

  const fetcher = useCallback(
    () => listeningService.getProblems({ targetLanguage: activeLanguage, difficulty: level }),
    [activeLanguage, level],
  );
  const { data: problems, loading, refetch } = useApi<ListeningPracticeItem[]>(fetcher);

  const allProblems = problems ?? [];
  const problem = allProblems[currentIndex];
  const totalProblems = allProblems.length;
  const displayedOptions = useMemo(() => {
    if (!problem) return [];
    return [...problem.options].sort(
      (a, b) => hashString(`${problem._id}:${a}`) - hashString(`${problem._id}:${b}`),
    );
  }, [problem]);

  useEffect(() => {
    return () => {
      audioService.stop().catch(() => undefined);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (initializedWithRouteParam.current) return;
    if (!requestedProblemId) {
      initializedWithRouteParam.current = true;
      return;
    }
    if (allProblems.length === 0) return;

    const targetIndex = allProblems.findIndex((item) => item._id === requestedProblemId);
    if (targetIndex >= 0) {
      setCurrentIndex(targetIndex);
    }
    initializedWithRouteParam.current = true;
  }, [allProblems, requestedProblemId]);

  const handleTogglePlay = useCallback(async () => {
    if (!problem) return;

    if (isPlaying) {
      await audioService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    try {
      await audioService.speak(problem.ttsText, {
        language: activeLanguage,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, problem, activeLanguage]);

  const handleSelect = useCallback(async (index: number) => {
    if (answered || !problem) return;
    setSelectedAnswer(index);
    setAnswered(true);

    try {
      const selectedOption = displayedOptions[index];
      if (!selectedOption) return;

      const res = await listeningService.answerProblem(problem._id, selectedOption);
      const result = res.data?.data;
      if (result) {
        if (result.correct) setCorrectCount((c) => c + 1);
        const cIdx = displayedOptions.findIndex((o) => o === result.correctAnswer);
        setServerCorrectIdx(cIdx >= 0 ? cIdx : null);
      }
    } catch {
      setServerCorrectIdx(null);
    }
  }, [answered, displayedOptions, problem]);

  const handleNext = () => {
    if (currentIndex < totalProblems - 1) {
      audioService.stop().catch(() => undefined);
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsPlaying(false);
      setServerCorrectIdx(null);
      setShowTranscript(false);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    if (serverCorrectIdx !== null && index === serverCorrectIdx) return 'correct';
    if (serverCorrectIdx === null && index === selectedAnswer) return 'selected';
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

  if (!problem) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎧</Text>
        <Text style={{ ...typography.body, color: colors.text.secondary }}>듣기 문제가 없습니다</Text>
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
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={totalProblems} height={6} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.counter}>문제 {currentIndex + 1}/{totalProblems}</Text>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.audioCard}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={handleTogglePlay}
            activeOpacity={0.8}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.audioHint}>{isPlaying ? '재생 중...' : '탭하여 듣기'}</Text>
          <View style={styles.waveform}>
            {[...Array(20)].map((_, i) => (
              <View key={i} style={[styles.waveBar, { height: Math.random() * 20 + 8, opacity: isPlaying ? 1 : 0.3 }]} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.transcriptButton}
            onPress={() => setShowTranscript((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.transcriptButtonText}>{showTranscript ? '예문 텍스트 숨기기' : '예문 텍스트 보기'}</Text>
          </TouchableOpacity>
          {showTranscript && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptText}>{problem.ttsText}</Text>
            </View>
          )}
        </Animated.View>

        <Text style={styles.question}>{problem.question}</Text>

        <View style={styles.options}>
          {displayedOptions.map((option, idx) => (
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
      </ScrollView>

      {answered && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>{currentIndex < totalProblems - 1 ? '다음' : '완료'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  progressWrapper: { flex: 1 },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 24, paddingBottom: 24 },
  counter: { fontSize: 13, color: '#AFAFAF', marginBottom: 12 },
  audioCard: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, gap: 12 },
  playButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF9600', justifyContent: 'center', alignItems: 'center' },
  playButtonActive: { backgroundColor: '#FF4B4B' },
  audioHint: { fontSize: 13, color: '#AFAFAF' },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 30 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: '#FF9600' },
  transcriptButton: { marginTop: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#EDF7FF' },
  transcriptButtonText: { ...typography.small, color: '#1CB0F6', fontWeight: '700' },
  transcriptBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  transcriptText: { ...typography.body, color: '#4B4B4B', textAlign: 'center' },
  question: { fontSize: 20, fontWeight: '700', color: '#4B4B4B', marginBottom: 20 },
  options: { gap: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  nextButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
