import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, ConversationDetail } from '../../types';
import BackButton from '../../components/BackButton';
import { conversationService } from '../../services/conversation.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationPractice'>;

export default function ConversationPracticeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { situationId } = route.params;

  const fetcher = useCallback(() => conversationService.getDetail(situationId), [situationId]);
  const { data, loading } = useApi<ConversationDetail>(fetcher);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [practicing, setPracticing] = useState(false);

  const dialogs = data?.dialogs ?? [];
  const current = dialogs[currentIndex];

  const handlePractice = async () => {
    setPracticing(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setPracticing(false);

    if (currentIndex < dialogs.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (dialogs.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
        <Text style={styles.emptyText}>연습할 대화가 없습니다</Text>
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
        <Text style={styles.finishSubtitle}>모든 문장을 따라 말하며 회화 흐름을 익혔어요.</Text>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>회화 연습</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{dialogs.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} key={currentIndex} style={styles.dialogCard}>
          <Text style={styles.speaker}>{current.speaker}</Text>
          <Text style={styles.dialogText}>{current.text}</Text>
          <View style={styles.divider} />
          <Text style={styles.translation}>{current.translation}</Text>
        </Animated.View>

        <View style={styles.practiceTipCard}>
          <Text style={styles.practiceTipTitle}>연습 팁</Text>
          <Text style={styles.practiceTipText}>
            원문을 소리 내어 따라 읽고, 번역을 보며 표현과 어순을 함께 익혀보세요.
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
            {practicing ? '연습 중...' : '따라 말하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  counter: { ...typography.caption, color: colors.text.secondary },
  content: { paddingHorizontal: 24, paddingBottom: 120 },
  dialogCard: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 24, marginBottom: 20 },
  speaker: { ...typography.caption, color: colors.primary.main, fontWeight: '700', marginBottom: 8 },
  dialogText: { ...typography.h2, color: colors.text.primary, lineHeight: 32, marginBottom: 16 },
  divider: { height: 1, backgroundColor: colors.border.light, marginBottom: 12 },
  translation: { ...typography.body, color: colors.text.secondary },
  practiceTipCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEBFF',
    padding: 16,
  },
  practiceTipTitle: { ...typography.body, color: colors.accent.blue, fontWeight: '700', marginBottom: 6 },
  practiceTipText: { ...typography.small, color: colors.text.secondary, lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  practiceBtn: { flexDirection: 'row', backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, justifyContent: 'center', alignItems: 'center', gap: 8 },
  practiceBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  emptyText: { ...typography.body, color: colors.text.secondary, marginBottom: 16 },
  backBtn: { backgroundColor: colors.primary.main, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 },
  backBtnText: { ...typography.button, color: '#FFF' },
  finishTitle: { ...typography.h1, color: colors.text.primary, marginBottom: 8 },
  finishSubtitle: { ...typography.body, color: colors.text.secondary, marginBottom: 24 },
});
