import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { listeningService } from '../../services/listening.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ListeningPractice'>;

interface ListeningProblem {
  _id: string;
  question: string;
  audioUrl?: string;
  options: string[];
  correctIndex?: number;
}

const LABELS = ['A', 'B', 'C', 'D'];

export default function ListeningPracticeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [serverCorrectIdx, setServerCorrectIdx] = useState<number | null>(null);

  const fetcher = useCallback(() => listeningService.getProblems(), []);
  const { data: problems, loading } = useApi<ListeningProblem[]>(fetcher);

  const allProblems = problems ?? [];
  const problem = allProblems[currentIndex];
  const totalProblems = allProblems.length;

  const handleSelect = useCallback(async (index: number) => {
    if (answered || !problem) return;
    setSelectedAnswer(index);
    setAnswered(true);

    try {
      const res = await listeningService.answerProblem(problem._id, problem.options[index]);
      const result = res.data?.data;
      if (result) {
        if (result.correct) setCorrectCount((c) => c + 1);
        // Find correct index from correctAnswer string
        const cIdx = problem.options.findIndex((o) => o === result.correctAnswer);
        setServerCorrectIdx(cIdx >= 0 ? cIdx : null);
      }
    } catch {
      if (problem.correctIndex !== undefined && index === problem.correctIndex) {
        setCorrectCount((c) => c + 1);
      }
    }
  }, [answered, problem]);

  const handleNext = () => {
    if (currentIndex < totalProblems - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsPlaying(false);
      setServerCorrectIdx(null);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    const correctIdx = serverCorrectIdx ?? problem?.correctIndex;
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

      <View style={styles.content}>
        <Text style={styles.counter}>문제 {currentIndex + 1}/{totalProblems}</Text>

        <Animated.View entering={FadeInDown.duration(400)} style={styles.audioCard}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
            onPress={() => setIsPlaying(!isPlaying)}
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
        </Animated.View>

        <Text style={styles.question}>{problem.question}</Text>

        <View style={styles.options}>
          {problem.options.map((option, idx) => (
            <QuizOption
              key={idx}
              label={LABELS[idx]}
              text={option}
              state={getOptionState(idx) as any}
              onPress={() => handleSelect(idx)}
              disabled={answered}
            />
          ))}
        </View>
      </View>

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
  content: { flex: 1, paddingHorizontal: 24 },
  counter: { fontSize: 13, color: '#AFAFAF', marginBottom: 12 },
  audioCard: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, gap: 12 },
  playButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF9600', justifyContent: 'center', alignItems: 'center' },
  playButtonActive: { backgroundColor: '#FF4B4B' },
  audioHint: { fontSize: 13, color: '#AFAFAF' },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 30 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: '#FF9600' },
  question: { fontSize: 20, fontWeight: '700', color: '#4B4B4B', marginBottom: 20 },
  options: { gap: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  nextButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
