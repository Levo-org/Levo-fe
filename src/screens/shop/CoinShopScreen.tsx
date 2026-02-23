import React, { useCallback, useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'CoinShop'>;

interface CoinsData {
  balance: number;
  transactions?: any[];
}

const EARN_METHODS: { id: 'ad_watch' | 'daily_check' | 'friend_invite'; emoji: string; title: string; desc: string; reward: string }[] = [
  { id: 'ad_watch', emoji: '🎬', title: '광고 시청', desc: '30초 광고 보고 20코인 획득', reward: '+20' },
  { id: 'daily_check', emoji: '📅', title: '매일 출석', desc: '매일 접속하면 10코인 지급', reward: '+10' },
  { id: 'friend_invite', emoji: '👥', title: '친구 초대', desc: '친구가 가입하면 100코인!', reward: '+100' },
];

export default function CoinShopScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { coins, setCoins } = useUserStore();
  const [earning, setEarning] = useState(false);

  const fetcher = useCallback(() => coinService.getCoins(), []);
  const { data, loading, refetch } = useApi<CoinsData>(fetcher);

  const balance = data?.balance ?? coins;

  const handleEarn = async (reason: 'ad_watch' | 'daily_check' | 'friend_invite') => {
    setEarning(true);
    try {
      const res = await coinService.earnCoins(reason);
      if (res.data?.success) {
        const d = res.data.data;
        setCoins(d.balance ?? balance + 20);
        refetch();
        Alert.alert('성공', `${d.earned ?? 20}코인 획득!`);
      } else {
        Alert.alert('실패', res.data?.message ?? '코인 획득에 실패했습니다');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '코인 획득에 실패했습니다');
    } finally {
      setEarning(false);
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
        <Text style={styles.headerTitle}>코인</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CoinShopUse')} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.shopLink}>사용하기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.balanceCard}>
          <Text style={styles.balanceEmoji}>🪙</Text>
          <Text style={styles.balanceAmount}>{balance}</Text>
          <Text style={styles.balanceLabel}>보유 코인</Text>
        </Animated.View>

        {/* Earn Methods */}
        <Text style={styles.sectionTitle}>코인 획득</Text>
        {EARN_METHODS.map((method, idx) => (
          <Animated.View entering={FadeInDown.delay(idx * 80).duration(400)} key={method.id}>
            <TouchableOpacity
              style={styles.earnCard}
              onPress={() => handleEarn(method.id)}
              disabled={earning}
              activeOpacity={0.7}
            >
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  shopLink: { ...typography.body, color: colors.primary.main, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  balanceCard: { backgroundColor: '#FFF7ED', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 32 },
  balanceEmoji: { fontSize: 40, marginBottom: 8 },
  balanceAmount: { fontSize: 44, fontWeight: '800', color: '#F59E0B', marginBottom: 4 },
  balanceLabel: { ...typography.body, color: '#92400E' },
  sectionTitle: { ...typography.h4, color: colors.text.primary, marginBottom: 12 },
  earnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, gap: 14 },
  earnEmoji: { fontSize: 28 },
  earnInfo: { flex: 1 },
  earnTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  earnDesc: { ...typography.small, color: colors.text.secondary },
  rewardBadge: { backgroundColor: '#F0FFF4', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  rewardText: { ...typography.caption, color: '#16A34A', fontWeight: '700' },
});
