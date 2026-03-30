import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ConversationDetail } from '../../types';
import BackButton from '../../components/BackButton';
import { conversationService } from '../../services/conversation.service';
import { audioService } from '../../services/audio.service';
import { useApi } from '../../hooks/useApi';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationDialog'>;

export default function ConversationDialogScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { situationId } = route.params;
  const activeLanguage = useAuthStore((state) => state.user?.activeLanguage ?? state.languageProfile?.targetLanguage ?? 'en');
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const playbackTokenRef = useRef(0);

  const fetcher = useCallback(() => conversationService.getDetail(situationId), [situationId]);
  const { data, loading } = useApi<ConversationDetail>(fetcher);
  const detail = data;
  const dialog = useMemo(
    () => (detail?.dialogs?.length ? detail.dialogs : (detail?.dialog ?? [])),
    [detail],
  );

  const getVoiceProfile = useCallback((speaker: string) => {
    const normalized = speaker.trim().toUpperCase();
    return normalized === 'B' || normalized.includes(' B') || normalized.startsWith('B') ? 'male' : 'female';
  }, []);

  const stopPlayback = useCallback(async () => {
    playbackTokenRef.current += 1;
    await audioService.stop();
    setIsPlayingAll(false);
    setActiveLineIndex(null);
  }, []);

  useEffect(() => {
    return () => {
      audioService.stop().catch(() => undefined);
    };
  }, []);

  const playLine = useCallback(
    async (lineText: string, speaker: string, lineIndex: number) => {
      if (!lineText.trim()) return;

      if (activeLineIndex === lineIndex && !isPlayingAll) {
        await stopPlayback();
        return;
      }

      const token = playbackTokenRef.current + 1;
      playbackTokenRef.current = token;
      await audioService.stop();

      setIsPlayingAll(false);
      setActiveLineIndex(lineIndex);

      try {
        await audioService.speak(lineText, {
          language: activeLanguage,
          rate: 0.9,
          voiceProfile: getVoiceProfile(speaker),
          transport: 'expo-only',
          onDone: () => {
            if (playbackTokenRef.current === token) {
              setActiveLineIndex(null);
            }
          },
          onStopped: () => {
            if (playbackTokenRef.current === token) {
              setActiveLineIndex(null);
            }
          },
          onError: () => {
            if (playbackTokenRef.current === token) {
              setActiveLineIndex(null);
            }
          },
        });
      } catch {
        if (playbackTokenRef.current === token) {
          setActiveLineIndex(null);
        }
      }
    },
    [activeLanguage, activeLineIndex, getVoiceProfile, isPlayingAll, stopPlayback],
  );

  const playAllDialog = useCallback(async () => {
    if (dialog.length === 0) return;

    if (isPlayingAll) {
      await stopPlayback();
      return;
    }

    const token = playbackTokenRef.current + 1;
    playbackTokenRef.current = token;
    await audioService.stop();

    setIsPlayingAll(true);

    try {
      for (let index = 0; index < dialog.length; index += 1) {
        if (playbackTokenRef.current !== token) return;

        const line = dialog[index];
        const lineText = line?.text?.trim();
        if (!lineText) continue;

        setActiveLineIndex(index);

        await audioService.speak(lineText, {
          language: activeLanguage,
          rate: 0.9,
          voiceProfile: getVoiceProfile(line.speaker),
          transport: 'expo-only',
        });
      }
    } finally {
      if (playbackTokenRef.current === token) {
        setIsPlayingAll(false);
        setActiveLineIndex(null);
      }
    }
  }, [activeLanguage, dialog, getVoiceProfile, isPlayingAll, stopPlayback]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>{detail?.title ?? '회화'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sceneBanner}>
          {detail?.description ? <Text style={styles.sceneTitle}>{detail.description}</Text> : null}
          <TouchableOpacity
            style={[styles.listenAllButton, isPlayingAll && styles.listenAllButtonActive]}
            activeOpacity={0.8}
            onPress={playAllDialog}
          >
            <Feather name={isPlayingAll ? 'pause' : 'volume-2'} size={16} color={isPlayingAll ? '#FFFFFF' : colors.primary.main} />
            <Text style={[styles.listenAllButtonText, isPlayingAll && styles.listenAllButtonTextActive]}>
              {isPlayingAll ? '전체 듣기 정지' : 'A/B 전체 듣기'}
            </Text>
          </TouchableOpacity>
        </View>

        {dialog.map((line, index) => (
          <Animated.View
            key={index}
            entering={line.isUser ? FadeInRight.delay(index * 200).duration(400) : FadeInLeft.delay(index * 200).duration(400)}
            style={[styles.bubbleRow, line.isUser && styles.bubbleRowRight]}
          >
            <View style={[styles.bubble, line.isUser ? styles.bubbleUser : styles.bubbleOther]}>
              <View style={styles.bubbleHeader}>
                <Text style={styles.speakerLabel}>화자 {line.speaker}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => playLine(line.text, line.speaker, index)}
                  style={[styles.lineListenButton, activeLineIndex === index && styles.lineListenButtonActive]}
                >
                  <Feather
                    name={activeLineIndex === index ? 'pause-circle' : 'volume-2'}
                    size={16}
                    color={line.isUser ? '#FFFFFF' : colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.bubbleText, line.isUser && styles.bubbleTextUser]}>{line.text}</Text>
              <Text style={[styles.bubbleTranslation, line.isUser && styles.bubbleTranslationUser]}>{line.translation}</Text>
            </View>
          </Animated.View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.practiceButton}
          onPress={() => navigation.navigate('ConversationPractice', { situationId })}
          activeOpacity={0.8}
        >
          <Feather name="mic" size={20} color="#FFFFFF" />
          <Text style={styles.practiceButtonText}>연습하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  sceneBanner: { alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, marginBottom: 24, gap: 10 },
  sceneTitle: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  listenAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F7E0',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  listenAllButtonActive: {
    backgroundColor: colors.primary.main,
  },
  listenAllButtonText: {
    ...typography.small,
    color: colors.primary.main,
    fontWeight: '700',
  },
  listenAllButtonTextActive: {
    color: '#FFFFFF',
  },
  bubbleRow: { marginBottom: 12, alignItems: 'flex-start' },
  bubbleRowRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 14 },
  bubbleOther: { backgroundColor: colors.background.secondary, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.primary.main, borderBottomRightRadius: 4 },
  bubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  speakerLabel: { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  lineListenButton: { padding: 2, borderRadius: 10 },
  lineListenButtonActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  bubbleText: { ...typography.body, color: colors.text.primary, fontWeight: '500' },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTranslation: { ...typography.caption, color: colors.text.secondary, marginTop: 6 },
  bubbleTranslationUser: { color: 'rgba(255,255,255,0.7)' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, backgroundColor: colors.background.primary },
  practiceButton: { flexDirection: 'row', backgroundColor: colors.accent.purple, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  practiceButtonText: { ...typography.button, color: '#FFFFFF' },
});
