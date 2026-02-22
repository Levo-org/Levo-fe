import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import QuizOption from '../../components/QuizOption';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizReview'>;

const REVIEW_QUESTIONS = [
  { id: 1, question: '"Delicious"의 뜻은?', options: ['아름다운', '맛있는', '재미있는', '어려운'], correctIndex: 1 },
  { id: 2, question: 'She ___ late yesterday.', options: ['arrive', 'arrives', 'arrived', 'arriving'], correctIndex: 2 },
  { id: 3, question: '"Hospital"의 뜻은?', options: ['학교', '도서관', '병원', '호텔'], correctIndex: 2 },
];

const LABELS = ['A', 'B', 'C', 'D'];

export default function QuizReviewScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);

  const q = REVIEW_QUESTIONS[currentIndex];
  const total = REVIEW_QUESTIONS.length;

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setCorrect((c) => c + 1);
  }, [answered, q]);

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      navigation.goBack();
    }
  };

  const getState = (idx: number) => {
    if (!answered) return 'default';
    if (idx === q.correctIndex) return 'correct';
    if (idx === selected) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#AFAFAF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <ProgressIndicator current={currentIndex + 1} total={total} height={6} />
        </View>
      </View>
      <View style={styles.content}>
        <Animated.View key={currentIndex} entering={FadeInDown.duration(400)}>
          <Text style={styles.counter}>복습 {currentIndex + 1}/{total}</Text>
          <Text style={styles.question}>{q.question}</Text>
          <View style={styles.options}>
            {q.options.map((opt, idx) => (
              <QuizOption key={idx} label={LABELS[idx]} text={opt} state={getState(idx) as any} onPress={() => handleSelect(idx)} disabled={answered} />
            ))}
          </View>
        </Animated.View>
      </View>
      {answered && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
          <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.btnText}>{currentIndex < total - 1 ? '다음' : '완료'}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, gap: 12 },
  content: { flex: 1, paddingHorizontal: 24 },
  counter: { fontSize: 13, color: '#AFAFAF', marginBottom: 8 },
  question: { fontSize: 22, fontWeight: '700', color: '#4B4B4B', marginBottom: 28 },
  options: { gap: 12 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, paddingTop: 12 },
  btn: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
