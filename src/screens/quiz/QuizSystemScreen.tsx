import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizSystem'>;

const QUIZ_QUESTIONS = [
  { id: 1, category: '어휘', question: '"Beautiful"의 뜻은?', options: ['못생긴', '아름다운', '슬픈', '재미있는'], correctIndex: 1 },
  { id: 2, category: '문법', question: 'She ___ a teacher.', options: ['am', 'is', 'are', 'be'], correctIndex: 1 },
  { id: 3, category: '어휘', question: '"Airport"의 뜻은?', options: ['항구', '역', '공항', '터미널'], correctIndex: 2 },
  { id: 4, category: '문법', question: 'I ___ to school yesterday.', options: ['go', 'goes', 'went', 'going'], correctIndex: 2 },
  { id: 5, category: '어휘', question: '"Delicious"의 뜻은?', options: ['맛없는', '맛있는', '매운', '싱거운'], correctIndex: 1 },
];

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizSystemScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = useCallback((index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === currentQ.correctIndex) setCorrectCount((c) => c + 1);
  }, [answered, currentQ]);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    if (index === currentQ.correctIndex) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  if (showResults) {
    const score = Math.round((correctCount / totalQuestions) * 100);
    return (
      <View style={styles.container}>
        <View style={styles.resultsContent}>
          <Text style={styles.resultsEmoji}>{score >= 80 ? '🏆' : score >= 60 ? '👏' : '💪'}</Text>
          <Text style={styles.resultsTitle}>퀴즈 완료!</Text>
          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>정답</Text>
              <Text style={styles.resultValue}>{correctCount}/{totalQuestions}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>점수</Text>
              <Text style={[styles.resultValue, { color: '#58CC02' }]}>{score}%</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>XP 획득</Text>
              <Text style={[styles.resultValue, { color: '#1CB0F6' }]}>+{correctCount * 5} XP</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>완료</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="x" size={24} color="#AFAFAF" />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={totalQuestions} height={6} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View key={currentIndex} entering={FadeInDown.duration(400)}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentQ.category}</Text>
          </View>
          <Text style={styles.counter}>문제 {currentIndex + 1}/{totalQuestions}</Text>
          <Text style={styles.question}>{currentQ.question}</Text>
          <View style={styles.options}>
            {currentQ.options.map((option, idx) => (
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
        </Animated.View>
      </View>

      {answered && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>{currentIndex < totalQuestions - 1 ? '다음' : '결과 보기'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, gap: 12 },
  progressWrapper: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#EDF7FF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  categoryText: { fontSize: 12, fontWeight: '700', color: '#1CB0F6' },
  counter: { fontSize: 13, color: '#AFAFAF', marginBottom: 8 },
  question: { fontSize: 22, fontWeight: '700', color: '#4B4B4B', marginBottom: 28 },
  options: { gap: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  nextButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  resultsContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  resultsEmoji: { fontSize: 72, marginBottom: 16 },
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#4B4B4B', marginBottom: 24 },
  resultsCard: { width: '100%', backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, gap: 16, marginBottom: 32 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 15, color: '#AFAFAF' },
  resultValue: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  doneButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  doneButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
