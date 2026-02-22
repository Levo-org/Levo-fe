import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import QuizOption from '../../components/QuizOption';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ReadingPractice'>;

const PASSAGE = {
  title: 'My Daily Routine',
  text: 'I wake up at 7 o\'clock every morning. First, I brush my teeth and wash my face. Then, I have breakfast with my family. I usually eat toast and drink orange juice. After breakfast, I go to school by bus. School starts at 8:30.',
  translation: '나는 매일 아침 7시에 일어납니다. 먼저, 양치를 하고 세수를 합니다. 그런 다음 가족과 함께 아침을 먹습니다. 보통 토스트를 먹고 오렌지 주스를 마십니다. 아침 식사 후, 버스로 학교에 갑니다. 학교는 8시 30분에 시작합니다.',
};

const QUESTIONS = [
  { id: 1, question: '화자는 몇 시에 일어나나요?', options: ['6시', '7시', '8시', '9시'], correctIndex: 1 },
  { id: 2, question: '아침으로 무엇을 먹나요?', options: ['밥', '시리얼', '토스트', '빵'], correctIndex: 2 },
];

const LABELS = ['A', 'B', 'C', 'D'];

export default function ReadingPracticeScreen({ navigation }: Props) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const question = QUESTIONS[currentQ];

  const handleSelect = useCallback((index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
  }, [answered]);

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      navigation.goBack();
    }
  };

  const getOptionState = (index: number) => {
    if (!answered) return 'default';
    if (index === question.correctIndex) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>읽기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.passageCard}>
          <Text style={styles.passageTitle}>{PASSAGE.title}</Text>
          <Text style={styles.passageText}>
            {showTranslation ? PASSAGE.translation : PASSAGE.text}
          </Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowTranslation(!showTranslation)}
            activeOpacity={0.7}
          >
            <Feather name="globe" size={16} color={colors.accent.blue} />
            <Text style={styles.toggleText}>{showTranslation ? '원문 보기' : '번역 보기'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.quizSection}>
          <Text style={styles.quizTitle}>문제 {currentQ + 1}/{QUESTIONS.length}</Text>
          <Text style={styles.questionText}>{question.question}</Text>
          <View style={styles.options}>
            {question.options.map((option, idx) => (
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
          <Animated.View entering={FadeInUp.duration(300)} style={styles.nextArea}>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>{currentQ < QUESTIONS.length - 1 ? '다음 문제' : '완료'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  passageCard: { backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, marginBottom: 24 },
  passageTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B', marginBottom: 12 },
  passageText: { fontSize: 15, color: '#4B4B4B', lineHeight: 24 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EDF7FF' },
  toggleText: { fontSize: 13, color: '#1CB0F6', fontWeight: '600' },
  quizSection: { marginBottom: 24 },
  quizTitle: { fontSize: 13, color: '#AFAFAF', marginBottom: 8 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#4B4B4B', marginBottom: 16 },
  options: { gap: 12 },
  nextArea: { paddingBottom: 12 },
  nextButton: { backgroundColor: '#58CC02', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
