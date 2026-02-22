import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { useUserStore } from '../../stores/userStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CoinShop'>;

const EARN_METHODS = [
  { id: 'ad', emoji: '🎬', title: '광고 시청', desc: '30초 광고 보고 20코인 획득', reward: '+20' },
  { id: 'daily', emoji: '📅', title: '매일 출석', desc: '매일 접속하면 10코인 지급', reward: '+10' },
  { id: 'invite', emoji: '👥', title: '친구 초대', desc: '친구가 가입하면 100코인!', reward: '+100' },
];

export default function CoinShopScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { coins } = useUserStore();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>코인 상점</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.balanceCard}>
          <Text style={styles.balanceEmoji}>💎</Text>
          <Text style={styles.balanceAmount}>{coins}</Text>
          <Text style={styles.balanceLabel}>보유 코인</Text>
        </Animated.View>

        <Text style={styles.sectionTitle}>코인 얻기</Text>
        <View style={styles.earnList}>
          {EARN_METHODS.map((method, idx) => (
            <Animated.View key={method.id} entering={FadeInDown.delay(100 + idx * 80).duration(400)}>
              <TouchableOpacity style={styles.earnCard} activeOpacity={0.7}>
                <Text style={styles.earnEmoji}>{method.emoji}</Text>
                <View style={styles.earnInfo}>
                  <Text style={styles.earnTitle}>{method.title}</Text>
                  <Text style={styles.earnDesc}>{method.desc}</Text>
                </View>
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardText}>{method.reward}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>코인 사용</Text>
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <TouchableOpacity
            style={styles.useCard}
            onPress={() => navigation.navigate('CoinShopUse')}
            activeOpacity={0.7}
          >
            <View style={styles.useLeft}>
              <Text style={styles.useEmoji}>🛍️</Text>
              <View>
                <Text style={styles.useTitle}>아이템 상점</Text>
                <Text style={styles.useDesc}>코인으로 유용한 아이템을 구매하세요</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="#AFAFAF" />
          </TouchableOpacity>
        </Animated.View>

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
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  balanceCard: { alignItems: 'center', backgroundColor: '#FFF8E1', borderRadius: 24, padding: 32, marginBottom: 24, gap: 4 },
  balanceEmoji: { fontSize: 48 },
  balanceAmount: { fontSize: 40, fontWeight: '800', color: '#FFC800' },
  balanceLabel: { fontSize: 14, color: '#AFAFAF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#4B4B4B', marginBottom: 12 },
  earnList: { gap: 10, marginBottom: 24 },
  earnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 14, gap: 12 },
  earnEmoji: { fontSize: 28 },
  earnInfo: { flex: 1 },
  earnTitle: { fontSize: 15, fontWeight: '700', color: '#4B4B4B' },
  earnDesc: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
  rewardBadge: { backgroundColor: '#E8F7E0', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  rewardText: { fontSize: 14, fontWeight: '800', color: '#58CC02' },
  useCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16 },
  useLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  useEmoji: { fontSize: 28 },
  useTitle: { fontSize: 15, fontWeight: '700', color: '#4B4B4B' },
  useDesc: { fontSize: 12, color: '#AFAFAF', marginTop: 2 },
});
