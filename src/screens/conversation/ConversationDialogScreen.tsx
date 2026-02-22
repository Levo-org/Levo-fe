import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ConversationDialog'>;

const DIALOG = [
  { id: 1, speaker: 'A', text: 'Hi, can I get a coffee please?', translation: '안녕하세요, 커피 한 잔 주세요.', isUser: false },
  { id: 2, speaker: 'B', text: 'Sure! What size would you like?', translation: '네! 어떤 사이즈로 드릴까요?', isUser: true },
  { id: 3, speaker: 'A', text: 'Medium, please. And can I have it iced?', translation: '미디엄이요. 아이스로 할 수 있나요?', isUser: false },
  { id: 4, speaker: 'B', text: 'Of course! That will be $4.50.', translation: '물론이요! 4달러 50센트입니다.', isUser: true },
  { id: 5, speaker: 'A', text: 'Here you go. Thank you!', translation: '여기요. 감사합니다!', isUser: false },
];

export default function ConversationDialogScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { situationId } = route.params;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>카페에서 주문하기</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sceneBanner}>
          <Text style={styles.sceneEmoji}>☕</Text>
          <Text style={styles.sceneTitle}>카페에서 커피를 주문하는 상황</Text>
        </View>

        {DIALOG.map((line, index) => (
          <Animated.View
            key={line.id}
            entering={line.isUser ? FadeInRight.delay(index * 200).duration(400) : FadeInLeft.delay(index * 200).duration(400)}
            style={[styles.bubbleRow, line.isUser && styles.bubbleRowRight]}
          >
            <View style={[styles.bubble, line.isUser ? styles.bubbleUser : styles.bubbleOther]}>
              <View style={styles.bubbleHeader}>
                <Text style={styles.speakerLabel}>화자 {line.speaker}</Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Feather name="volume-2" size={16} color={line.isUser ? '#FFFFFF' : colors.text.secondary} />
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
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 12,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sceneBanner: {
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sceneEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  sceneTitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  bubbleRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bubbleRowRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 14,
  },
  bubbleOther: {
    backgroundColor: colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primary.main,
    borderBottomRightRadius: 4,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  speakerLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  bubbleText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTranslation: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 6,
  },
  bubbleTranslationUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: colors.background.primary,
  },
  practiceButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent.purple,
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  practiceButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
});
