import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { coinService } from '../../services/coin.service';
import { useApi } from '../../hooks/useApi';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'CoinShopUse'>;

const ITEMS = [
  { id: 'heart_refill', emoji: '❤️', name: '하트 전체 회복', desc: '모든 하트를 채워줍니다', price: 350 },
  { id: 'streak_shield', emoji: '🛡️', name: '스트릭 실드', desc: '하루 놓쳐도 스트릭 유지', price: 200 },
  { id: 'xp_boost', emoji: '⚡', name: 'XP 부스트', desc: '1시간 동안 XP 2배', price: 300 },
  { id: 'hint', emoji: '💡', name: '힌트 3개', desc: '퀴즈에서 힌트 사용', price: 100 },
  { id: 'timer_freeze', emoji: '⏸️', name: '타이머 정지', desc: '퀴즈 타이머 5초 추가', price: 50 },
  { id: 'extra_lesson', emoji: '📖', name: '보너스 레슨', desc: '추가 레슨 1개 해금', price: 500 },
];

interface CoinsData {
  balance: number;
}

export default function CoinShopUseScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { coins, setCoins } = useUserStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const fetcher = useCallback(() => coinService.getCoins(), []);
  const { data, loading, refetch } = useApi<CoinsData>(fetcher);

  const balance = data?.balance ?? coins;

  const handlePurchase = async (item: typeof ITEMS[0]) => {
    if (balance < item.price) {
      Alert.alert('코인 부족', '코인이 부족합니다. 코인을 먼저 획득해주세요.');
      return;
    }

    setPurchasing(item.id);
    try {
      const res = await coinService.spendCoins(item.id);
      if (res.data?.success) {
        const d = res.data.data;
        setCoins(d.balance ?? balance - item.price);
        refetch();
        Alert.alert('구매 완료', `${item.name}을(를) 구매했습니다!`);
      } else {
        Alert.alert('실패', res.data?.message ?? '구매에 실패했습니다');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '구매에 실패했습니다');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>코인 사용</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>🪙 {balance}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {ITEMS.map((item, idx) => {
          const canAfford = balance >= item.price;
          return (
            <Animated.View entering={FadeInDown.delay(idx * 80).duration(400)} key={item.id}>
              <TouchableOpacity
                style={[styles.card, !canAfford && styles.cardDisabled]}
                onPress={() => handlePurchase(item)}
                disabled={purchasing !== null || !canAfford}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
                <View style={styles.info}>
                  <Text style={[styles.name, !canAfford && styles.textDisabled]}>{item.name}</Text>
                  <Text style={styles.desc}>{item.desc}</Text>
                </View>
                <View style={[styles.priceBadge, !canAfford && styles.priceBadgeDisabled]}>
                  <Text style={[styles.priceText, !canAfford && styles.priceTextDisabled]}>🪙 {item.price}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  coinBadge: { backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  coinBadgeText: { ...typography.caption, color: '#F59E0B', fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, gap: 14 },
  cardDisabled: { opacity: 0.5 },
  emoji: { fontSize: 32 },
  info: { flex: 1 },
  name: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  textDisabled: { color: colors.text.tertiary },
  desc: { ...typography.small, color: colors.text.secondary },
  priceBadge: { backgroundColor: '#FFF7ED', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  priceBadgeDisabled: { backgroundColor: colors.border.light },
  priceText: { ...typography.caption, color: '#F59E0B', fontWeight: '700' },
  priceTextDisabled: { color: colors.text.tertiary },
});
