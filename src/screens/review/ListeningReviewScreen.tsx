import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ListeningReview'>;

export default function ListeningReviewScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>듣기 복습</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎧</Text>
        <Text style={styles.title}>듣기 복습</Text>
        <Text style={styles.desc}>이전에 학습한 듣기 문제를 다시 풀어보세요</Text>
        <Text style={styles.count}>복습 가능: 4개</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#4B4B4B', marginBottom: 8 },
  desc: { fontSize: 15, color: '#AFAFAF', textAlign: 'center', marginBottom: 16 },
  count: { fontSize: 16, fontWeight: '700', color: '#FF9600' },
});
