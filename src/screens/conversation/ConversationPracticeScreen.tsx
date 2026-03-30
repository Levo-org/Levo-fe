import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ConversationDetail } from '../../types';
import { conversationService } from '../../services/conversation.service';
import { audioService } from '../../services/audio.service';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationPractice'>;
const REPETITION_COUNT = 3;

type PracticePair = {
  aLine: { speaker: string; text: string; translation: string };
  bLine: { speaker: string; text: string; translation: string };
};

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const estimateUserSpeakWindowMs = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 2000;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const estimatedByWords = wordCount * 700;
  const estimatedByChars = trimmed.length * 120;
  const estimated = Math.max(estimatedByWords, estimatedByChars);

  return Math.min(Math.max(estimated, 2000), 12000);
};

const toPairList = (dialogs: ConversationDetail['dialogs']): PracticePair[] => {
  const pairs: PracticePair[] = [];

  for (let index = 0; index < dialogs.length - 1; index += 2) {
    const first = dialogs[index];
    const second = dialogs[index + 1];
    if (!first || !second) continue;

    pairs.push({
      aLine: { speaker: first.speaker, text: first.text, translation: first.translation },
      bLine: { speaker: second.speaker, text: second.text, translation: second.translation },
    });
  }

  return pairs;
};

export default function ConversationPracticeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { situationId } = route.params;
  const activeLanguage = useAuthStore((state) => state.user?.activeLanguage ?? state.languageProfile?.targetLanguage ?? 'en');

  const fetcher = useCallback(() => conversationService.getDetail(situationId), [situationId]);
  const { data, loading } = useApi<ConversationDetail>(fetcher);

  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState('대기 중');
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [userSpeakingRole, setUserSpeakingRole] = useState<'A' | 'B' | null>(null);
  const [finished, setFinished] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const practiceTokenRef = useRef(0);

  const dialogs = useMemo(() => data?.dialogs ?? [], [data]);
  const pairs = useMemo(() => toPairList(dialogs), [dialogs]);
  const currentPair = pairs[currentPairIndex];

  const stopPracticeFlow = useCallback(async () => {
    practiceTokenRef.current += 1;
    await audioService.stop();
    setPracticing(false);
    setCountdownSec(null);
    setUserSpeakingRole(null);
    setCurrentStepLabel('대기 중');
  }, []);

  const handleGoBack = useCallback(async () => {
    await stopPracticeFlow();
    navigation.goBack();
  }, [navigation, stopPracticeFlow]);

  useEffect(() => {
    return () => {
      audioService.stop().catch(() => undefined);
    };
  }, []);

  const runUserSpeakWindow = useCallback(async (text: string, token: number, label: string, role: 'A' | 'B') => {
    const durationMs = estimateUserSpeakWindowMs(text);
    const totalSeconds = Math.max(1, Math.ceil(durationMs / 1000));
    setCurrentStepLabel(label);
    setUserSpeakingRole(role);
    setCountdownSec(totalSeconds);

    for (let sec = totalSeconds; sec >= 1; sec -= 1) {
      if (practiceTokenRef.current !== token) return;
      setCountdownSec(sec);
      await wait(1000);
    }

    setCountdownSec(null);
    setUserSpeakingRole(null);
  }, []);

  const handlePractice = async () => {
    if (practicing || pairs.length === 0) return;

    const token = practiceTokenRef.current + 1;
    practiceTokenRef.current = token;

    setPracticing(true);
    setFinished(false);
    setCurrentPairIndex(0);
    setCurrentCycle(1);

    await audioService.stop();

    try {
      for (let cycle = 1; cycle <= REPETITION_COUNT; cycle += 1) {
        if (practiceTokenRef.current !== token) return;
        setCurrentCycle(cycle);

        const isATtsTurn = cycle % 2 === 1;

        for (let pairIndex = 0; pairIndex < pairs.length; pairIndex += 1) {
          if (practiceTokenRef.current !== token) return;

          const pair = pairs[pairIndex];
          setCurrentPairIndex(pairIndex);

          if (isATtsTurn) {
            setCurrentStepLabel(`반복 ${cycle}/${REPETITION_COUNT} - A 음성 듣기`);
            await audioService.speak(pair.aLine.text, {
              language: activeLanguage,
              rate: 0.9,
              voiceProfile: 'female',
              transport: 'expo-only',
            });

            if (practiceTokenRef.current !== token) return;

            await runUserSpeakWindow(
              pair.bLine.text,
              token,
              `반복 ${cycle}/${REPETITION_COUNT} - B 문장 따라 말하기`,
              'B',
            );
          } else {
            await runUserSpeakWindow(
              pair.aLine.text,
              token,
              `반복 ${cycle}/${REPETITION_COUNT} - A 문장 따라 말하기`,
              'A',
            );

            if (practiceTokenRef.current !== token) return;

            setCurrentStepLabel(`반복 ${cycle}/${REPETITION_COUNT} - B 음성 듣기`);
            await audioService.speak(pair.bLine.text, {
              language: activeLanguage,
              rate: 0.9,
              voiceProfile: 'male',
              transport: 'expo-only',
            });
          }
        }
      }

      if (practiceTokenRef.current !== token) return;
      setFinished(true);
    } finally {
      if (practiceTokenRef.current === token) {
        setPracticing(false);
        setCountdownSec(null);
        setUserSpeakingRole(null);
        setCurrentStepLabel('완료');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (pairs.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}> 
        <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
        <Text style={styles.emptyText}>연습할 A/B 대화 쌍이 없습니다</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}> 
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🎉</Text>
        <Text style={styles.finishTitle}>연습 완료!</Text>
        <Text style={styles.finishSubtitle}>A/B 턴 기반 따라 말하기를 3회 반복 완료했어요.</Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { void handleGoBack(); }} activeOpacity={0.7} style={styles.backButton}>
          <Feather name="chevron-left" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>회화 연습</Text>
        <Text style={styles.counter}>{currentPairIndex + 1}/{pairs.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} key={`${currentPairIndex}-${currentCycle}`} style={styles.dialogCard}>
          <View style={[styles.roleBlock, userSpeakingRole === 'A' && styles.activeRoleBlock]}>
            <Text style={[styles.speaker, userSpeakingRole === 'A' && styles.activeSpeaker]}>A ({currentPair.aLine.speaker})</Text>
            <Text style={[styles.dialogText, userSpeakingRole === 'A' && styles.activeDialogText]}>{currentPair.aLine.text}</Text>
            <View style={styles.divider} />
            <Text style={[styles.translation, userSpeakingRole === 'A' && styles.activeTranslation]}>{currentPair.aLine.translation}</Text>
          </View>
          <View style={styles.pairGap} />
          <View style={[styles.roleBlock, userSpeakingRole === 'B' && styles.activeRoleBlock]}>
            <Text style={[styles.speaker, userSpeakingRole === 'B' && styles.activeSpeaker]}>B ({currentPair.bLine.speaker})</Text>
            <Text style={[styles.dialogText, userSpeakingRole === 'B' && styles.activeDialogText]}>{currentPair.bLine.text}</Text>
            <View style={styles.divider} />
            <Text style={[styles.translation, userSpeakingRole === 'B' && styles.activeTranslation]}>{currentPair.bLine.translation}</Text>
          </View>
        </Animated.View>

        <View style={styles.practiceTipCard}>
          <Text style={styles.practiceTipTitle}>반복 진행</Text>
          <Text style={styles.practiceStatus}>반복 {Math.min(Math.max(currentCycle, 1), REPETITION_COUNT)} / {REPETITION_COUNT}</Text>
          <Text style={styles.practiceStatus}>{currentStepLabel}</Text>
          {countdownSec !== null && <Text style={styles.countdownText}>사용자 말하기 남은 시간: {countdownSec}초</Text>}
          <View style={{ height: 8 }} />
          <Text style={styles.practiceTipTitle}>학습 방식</Text>
          <Text style={styles.practiceTipText}>
            1회차/3회차: A는 TTS, B는 사용자 따라 말하기. 2회차: A는 사용자 따라 말하기, B는 TTS.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.practiceBtn}
          onPress={handlePractice}
          disabled={practicing}
          activeOpacity={0.8}
        >
          <Feather name="mic" size={22} color="#FFF" />
          <Text style={styles.practiceBtnText}>
            {practicing ? '반복 학습 진행 중...' : '따라 말하기 시작'}
          </Text>
        </TouchableOpacity>
        {practicing && (
          <TouchableOpacity
            style={styles.stopBtn}
            onPress={stopPracticeFlow}
            activeOpacity={0.8}
          >
            <Feather name="square" size={18} color={colors.status.error} />
            <Text style={styles.stopBtnText}>학습 중지</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  counter: { ...typography.caption, color: colors.text.secondary },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  dialogCard: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 24, marginBottom: 20 },
  roleBlock: {
    borderRadius: 12,
    padding: 8,
  },
  activeRoleBlock: {
    backgroundColor: '#FFF7D6',
    borderWidth: 1,
    borderColor: '#F4C542',
  },
  pairGap: { height: 14 },
  speaker: { ...typography.caption, color: colors.primary.main, fontWeight: '700', marginBottom: 8 },
  activeSpeaker: {
    color: '#B7791F',
  },
  dialogText: { ...typography.h2, color: colors.text.primary, lineHeight: 32, marginBottom: 16 },
  activeDialogText: {
    color: '#8A5B00',
  },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: 12 },
  translation: { ...typography.body, color: colors.text.secondary },
  activeTranslation: {
    color: '#805400',
  },
  practiceTipCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEBFF',
    padding: 16,
  },
  practiceTipTitle: { ...typography.body, color: colors.accent.blue, fontWeight: '700', marginBottom: 6 },
  practiceStatus: { ...typography.small, color: colors.text.primary, marginBottom: 4, fontWeight: '600' },
  countdownText: { ...typography.small, color: colors.primary.main, fontWeight: '700' },
  practiceTipText: { ...typography.small, color: colors.text.secondary, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  practiceBtn: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  practiceBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  stopBtn: {
    marginTop: 10,
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD7D7',
    backgroundColor: '#FFF5F5',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  stopBtnText: { ...typography.small, color: colors.status.error, fontWeight: '700' },
  emptyText: { ...typography.body, color: colors.text.secondary, marginBottom: 16 },
  backBtn: { backgroundColor: colors.primary.main, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  backBtnText: { ...typography.button, color: '#FFF' },
  finishTitle: { ...typography.h1, color: colors.text.primary, marginBottom: 8 },
  finishSubtitle: { ...typography.body, color: colors.text.secondary, marginBottom: 24 },
});
