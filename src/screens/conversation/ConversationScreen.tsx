import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SITUATIONS = [
  { id: '1', emoji: '☕', title: '카페에서 주문하기', desc: 'Ordering at a café', difficulty: '초급', completed: true },
  { id: '2', emoji: '🏨', title: '호텔 체크인', desc: 'Hotel check-in', difficulty: '초급', completed: true },
  { id: '3', emoji: '🚕', title: '택시 타기', desc: 'Taking a taxi', difficulty: '중급', completed: false },
  { id: '4', emoji: '🛒', title: '쇼핑하기', desc: 'Shopping', difficulty: '중급', completed: false },
  { id: '5', emoji: '🏥', title: '병원 방문', desc: 'Visiting a hospital', difficulty: '고급', completed: false },
  { id: '6', emoji: '✈️', title: '공항에서', desc: 'At the airport', difficulty: '중급', completed: false },
];

const difficultyColors: Record<string, string> = {
  '초급': colors.primary.main,
  '중급': colors.accent.blue,
  '고급': colors.accent.purple,
};

export default function ConversationScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>회화</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SITUATIONS.map((sit, index) => (
          <Animated.View key={sit.id} entering={FadeInDown.delay(index * 80).duration(400)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ConversationDialog', { situationId: sit.id })}
              activeOpacity={0.7}
            >
              <Text style={styles.cardEmoji}>{sit.emoji}</Text>
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{sit.title}</Text>
                  {sit.completed && <Feather name="check-circle" size={18} color={colors.primary.main} />}
                </View>
                <Text style={styles.cardDesc}>{sit.desc}</Text>
                <View style={[styles.diffBadge, { backgroundColor: (difficultyColors[sit.difficulty] || colors.accent.blue) + '15' }]}>
                  <Text style={[styles.diffText, { color: difficultyColors[sit.difficulty] }]}>{sit.difficulty}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardEmoji: {
    fontSize: 40,
  },
  cardContent: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardDesc: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  diffBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  diffText: {
    ...typography.caption,
    fontWeight: '700',
  },
});
