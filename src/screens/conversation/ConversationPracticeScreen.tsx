import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import ProgressIndicator from '../../components/ProgressIndicator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationPractice'>;

const PRACTICE_LINES = [
  { id: 1, text: 'Hi, can I get a coffee please?', translation: '안녕하세요, 커피 한 잔 주세요.' },
  { id: 2, text: 'Medium, please.', translation: '미디엄이요.' },
  { id: 3, text: 'Thank you!', translation: '감사합니다!' },
];

export default function ConversationPracticeScreen({ navigation, route }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentLine = PRACTICE_LINES[currentIndex];
  const totalLines = PRACTICE_LINES.length;

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      // Mock score
      setScore(Math.floor(Math.random() * 30) + 70);
    } else {
      setIsRecording(true);
      setScore(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalLines - 1) {
      setCurrentIndex((i) => i + 1);
      setScore(null);
      setIsRecording(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="x" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressIndicator current={currentIndex + 1} total={totalLines} height={6} />
        </View>
      </View>

      <View style={styles.content}>
        <Animated.View key={currentIndex} entering={FadeInDown.duration(400)} style={styles.lineCard}>
          <Text style={styles.instruction}>다음 문장을 말해보세요</Text>
          <Text style={styles.lineText}>{currentLine.text}</Text>
          <Text style={styles.lineTranslation}>{currentLine.translation}</Text>
          <TouchableOpacity style={styles.listenButton} activeOpacity={0.7}>
            <Feather name="volume-2" size={18} color={colors.accent.blue} />
            <Text style={styles.listenText}>듣기</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.micArea}>
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handleRecord}
            activeOpacity={0.8}
          >
            <Feather name="mic" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.micHint}>
            {isRecording ? '녹음 중... 탭하여 중지' : '탭하여 녹음 시작'}
          </Text>
        </View>

        {score !== null && (
          <Animated.View entering={ZoomIn.duration(400)} style={styles.scoreCard}>
            <Text style={styles.scoreEmoji}>{score >= 80 ? '🎉' : score >= 60 ? '👏' : '💪'}</Text>
            <Text style={styles.scoreValue}>{score}점</Text>
            <Text style={styles.scoreLabel}>발음 정확도</Text>
          </Animated.View>
        )}
      </View>

      {score !== null && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>
              {currentIndex < totalLines - 1 ? '다음' : '완료'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  lineCard: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  instruction: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  lineText: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  lineTranslation: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EDF7FF',
  },
  listenText: {
    ...typography.small,
    color: colors.accent.blue,
    fontWeight: '600',
  },
  micArea: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: colors.status.error,
  },
  micHint: {
    ...typography.small,
    color: colors.text.secondary,
  },
  scoreCard: {
    alignItems: 'center',
    gap: 4,
  },
  scoreEmoji: {
    fontSize: 36,
  },
  scoreValue: {
    ...typography.h1,
    color: colors.primary.main,
  },
  scoreLabel: {
    ...typography.small,
    color: colors.text.secondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
