import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'GrammarReview'>;

const REVIEW_ITEMS = [
  { id: '1', rule: '현재 시제', example: 'She goes to school.', tip: '3인칭 단수 -s 추가' },
  { id: '2', rule: '과거 시제', example: 'I went to the store.', tip: '불규칙 변화 주의' },
  { id: '3', rule: 'Be 동사', example: 'They are students.', tip: '주어에 맞는 be 동사 선택' },
];

export default function GrammarReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>문법 복습</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {REVIEW_ITEMS.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).duration(400)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => setExpanded(expanded === item.id ? null : item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.ruleTitle}>{item.rule}</Text>
                <Feather name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={20} color="#AFAFAF" />
              </View>
              {expanded === item.id && (
                <View style={styles.cardBody}>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleLabel}>예문</Text>
                    <Text style={styles.exampleText}>{item.example}</Text>
                  </View>
                  <View style={styles.tipBox}>
                    <Feather name="info" size={14} color="#1CB0F6" />
                    <Text style={styles.tipText}>{item.tip}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  card: { backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ruleTitle: { fontSize: 16, fontWeight: '700', color: '#4B4B4B' },
  cardBody: { marginTop: 12, gap: 12 },
  exampleBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, gap: 4 },
  exampleLabel: { fontSize: 12, color: '#AFAFAF', fontWeight: '600' },
  exampleText: { fontSize: 15, color: '#4B4B4B', fontWeight: '500' },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDF7FF', borderRadius: 8, padding: 10 },
  tipText: { fontSize: 13, color: '#1CB0F6', flex: 1 },
});
