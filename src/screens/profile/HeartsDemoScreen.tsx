import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { useHeartStore } from '../../stores/heartStore';

type Props = NativeStackScreenProps<RootStackParamList, 'HeartsDemo'>;

export default function HeartsDemoScreen({ navigation }: Props) {
  const { currentHearts, maxHearts } = useHeartStore();
  const hearts = Array.from({ length: maxHearts }, (_, i) => i < currentHearts);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>하트</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heartsCard}>
          <View style={styles.heartsRow}>
            {hearts.map((filled, idx) => (
              <Feather key={idx} name="heart" size={36} color={filled ? '#FF4B4B' : '#E5E5E5'} />
            ))}
          </View>
          <Text style={styles.heartsCount}>{currentHearts}/{maxHearts}</Text>
          <Text style={styles.heartsLabel}>남은 하트</Text>
          <Text style={styles.refillTimer}>다음 하트: 28:45</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.infoCard}>
          <Feather name="info" size={18} color="#1CB0F6" />
          <Text style={styles.infoText}>
            틀린 답을 선택하면 하트가 1개 차감됩니다. 하트는 4시간마다 1개씩 자동으로 회복됩니다.
          </Text>
        </Animated.View>

        <Text style={styles.sectionTitle}>하트 회복 방법</Text>
        <View style={styles.options}>
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.optionIcon, { backgroundColor: '#E8F7E0' }]}>
                <Feather name="play-circle" size={24} color="#58CC02" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>광고 시청</Text>
                <Text style={styles.optionDesc}>광고를 보고 하트 1개 회복</Text>
              </View>
              <Text style={styles.optionBadge}>무료</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <TouchableOpacity style={styles.optionCard} activeOpacity={0.7}>
              <View style={[styles.optionIcon, { backgroundColor: '#FFF8E1' }]}>
                <Text style={{ fontSize: 20 }}>💎</Text>
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>코인으로 구매</Text>
                <Text style={styles.optionDesc}>350 코인으로 모든 하트 회복</Text>
              </View>
              <Text style={[styles.optionBadge, { color: '#FFC800' }]}>350</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <TouchableOpacity
              style={[styles.optionCard, styles.premiumCard]}
              onPress={() => navigation.navigate('Premium')}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#F3E8FF' }]}>
                <Feather name="star" size={24} color="#CE82FF" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>프리미엄</Text>
                <Text style={styles.optionDesc}>무제한 하트 사용</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#CE82FF" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  heartsCard: { alignItems: 'center', backgroundColor: '#FFEBEE', borderRadius: 24, padding: 32, marginBottom: 16, gap: 8 },
  heartsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  heartsCount: { fontSize: 28, fontWeight: '800', color: '#FF4B4B' },
  heartsLabel: { fontSize: 14, color: '#AFAFAF' },
  refillTimer: { fontSize: 13, color: '#AFAFAF', marginTop: 4 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EDF7FF', borderRadius: 12, padding: 14, marginBottom: 24 },
  infoText: { fontSize: 13, color: '#4B4B4B', flex: 1, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#4B4B4B', marginBottom: 12 },
  options: { gap: 10 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 14, gap: 12 },
  premiumCard: { borderWidth: 2, borderColor: '#CE82FF', backgroundColor: '#FAFAFA' },
  optionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#4B4B4B' },
  optionDesc: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
  optionBadge: { fontSize: 14, fontWeight: '800', color: '#58CC02' },
});
