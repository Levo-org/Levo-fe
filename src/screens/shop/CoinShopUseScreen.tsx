import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { useUserStore } from '../../stores/userStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CoinShopUse'>;

const ITEMS = [
  { id: 'heart_refill', emoji: '❤️', name: '하트 전체 회복', desc: '모든 하트를 채워줍니다', price: 350 },
  { id: 'streak_shield', emoji: '🛡️', name: '스트릭 실드', desc: '하루 놓쳐도 스트릭 유지', price: 200 },
  { id: 'xp_boost', emoji: '⚡', name: 'XP 부스트', desc: '1시간 동안 XP 2배', price: 300 },
  { id: 'hint', emoji: '💡', name: '힌트 3개', desc: '퀴즈에서 힌트 사용', price: 100 },
  { id: 'timer_freeze', emoji: '⏸️', name: '타이머 정지', desc: '퀴즈 타이머 5초 추가', price: 50 },
  { id: 'extra_lesson', emoji: '📖', name: '보너스 레슨', desc: '추가 레슨 1개 해금', price: 500 },
];

export default function CoinShopUseScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { coins } = useUserStore();

  const handlePurchase = (item: typeof ITEMS[0]) => {
    if (coins < item.price) {
      Alert.alert('코인 부족', '코인이 부족합니다. 코인을 더 모아보세요!');
    } else {
      Alert.alert('구매 확인', `${item.name}을(를) ${item.price} 코인으로 구매하시겠습니까?`, [
        { text: '취소', style: 'cancel' },
        { text: '구매', onPress: () => {} },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <BackButton />
        <Text style={styles.headerTitle}>아이템 상점</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinEmoji}>💎</Text>
          <Text style={styles.coinAmount}>{coins}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ITEMS.map((item, idx) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(idx * 60).duration(400)} style={styles.itemCard}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
              <TouchableOpacity
                style={[styles.buyButton, coins < item.price && styles.buyButtonDisabled]}
                onPress={() => handlePurchase(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.buyEmoji}>💎</Text>
                <Text style={[styles.buyPrice, coins < item.price && styles.buyPriceDisabled]}>{item.price}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#4B4B4B' },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E1', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10 },
  coinEmoji: { fontSize: 14 },
  coinAmount: { fontSize: 14, fontWeight: '800', color: '#FFC800' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  itemCard: { width: '47%', backgroundColor: '#F7F7F7', borderRadius: 16, padding: 16, alignItems: 'center', gap: 6 },
  itemEmoji: { fontSize: 36 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#4B4B4B', textAlign: 'center' },
  itemDesc: { fontSize: 11, color: '#AFAFAF', textAlign: 'center' },
  buyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFC800', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10, gap: 4, marginTop: 4 },
  buyButtonDisabled: { backgroundColor: '#E5E5E5' },
  buyEmoji: { fontSize: 12 },
  buyPrice: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  buyPriceDisabled: { color: '#AFAFAF' },
});
