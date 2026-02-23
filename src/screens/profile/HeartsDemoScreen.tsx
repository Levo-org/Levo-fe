import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { heartService } from '../../services/heart.service';
import { useApi } from '../../hooks/useApi';
import { useHeartStore } from '../../stores/heartStore';
import { useUserStore } from '../../stores/userStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'HeartsDemo'>;

interface HeartsData {
  currentHearts: number;
  maxHearts: number;
  timeUntilNextRefill: string;
  timeUntilFullRefill: string;
  isPremium: boolean;
}

export default function HeartsDemoScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setHearts, refillAll } = useHeartStore();
  const { coins, setCoins } = useUserStore();
  const [refilling, setRefilling] = useState(false);

  const fetcher = useCallback(() => heartService.getHearts(), []);
  const { data, loading, refetch } = useApi<HeartsData>(fetcher);

  const currentHearts = data?.currentHearts ?? useHeartStore.getState().currentHearts;
  const maxHearts = data?.maxHearts ?? 5;
  const timeUntilNext = data?.timeUntilNextRefill ?? '--:--';
  const isPremium = data?.isPremium ?? false;

  const handleRefill = async (method: 'ad' | 'coin_single' | 'coin_full') => {
    setRefilling(true);
    try {
      const res = await heartService.refillHearts(method);
      if (res.data?.success) {
        const d = res.data.data;
        setHearts(d.currentHearts ?? maxHearts, d.timeUntilNextRefill ?? null);
        if (d.coinsRemaining != null) setCoins(d.coinsRemaining);
        refetch();
        Alert.alert('성공', '하트가 회복되었습니다!');
      } else {
        Alert.alert('실패', res.data?.message ?? '하트 회복에 실패했습니다');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '하트 회복에 실패했습니다');
    } finally {
      setRefilling(false);
    }
  };

  const hearts = Array.from({ length: maxHearts }, (_, i) => i < currentHearts);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.status.error} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>하트</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        {/* Hearts Display */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heartsRow}>
          {hearts.map((filled, i) => (
            <Feather
              key={i}
              name="heart"
              size={36}
              color={filled ? colors.status.error : colors.border.light}
              style={{ marginHorizontal: 4 }}
            />
          ))}
        </Animated.View>

        <Text style={styles.heartCount}>{currentHearts} / {maxHearts}</Text>

        {currentHearts < maxHearts && !isPremium && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.timerCard}>
            <Feather name="clock" size={18} color={colors.text.secondary} />
            <Text style={styles.timerText}>다음 하트: {timeUntilNext}</Text>
          </Animated.View>
        )}

        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>👑 프리미엄 — 무제한 하트</Text>
          </View>
        )}

        {/* Refill Options */}
        {!isPremium && currentHearts < maxHearts && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.options}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleRefill('ad')}
              disabled={refilling}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>🎬</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>광고 시청</Text>
                <Text style={styles.optionDesc}>30초 광고를 보고 하트 1개</Text>
              </View>
              <View style={styles.optionBadge}>
                <Text style={styles.optionBadgeText}>무료</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => handleRefill('coin_full')}
              disabled={refilling}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>🪙</Text>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>코인으로 전체 회복</Text>
                <Text style={styles.optionDesc}>350코인 (보유: {coins})</Text>
              </View>
              <View style={[styles.optionBadge, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.optionBadgeText, { color: '#F59E0B' }]}>350</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, { backgroundColor: colors.primary.main }]}
              onPress={() => navigation.navigate('Premium')}
              activeOpacity={0.7}
            >
              <Text style={styles.optionEmoji}>👑</Text>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, { color: '#FFF' }]}>프리미엄 가입</Text>
                <Text style={[styles.optionDesc, { color: '#FFFFFF99' }]}>무제한 하트 사용</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#FFF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  heartsRow: { flexDirection: 'row', marginBottom: 12 },
  heartCount: { ...typography.h2, color: colors.text.primary, marginBottom: 16 },
  timerCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background.secondary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 32 },
  timerText: { ...typography.body, color: colors.text.secondary },
  premiumBadge: { backgroundColor: '#FFF7ED', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 32 },
  premiumText: { ...typography.body, color: '#F59E0B', fontWeight: '600' },
  options: { width: '100%', gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, gap: 14 },
  optionEmoji: { fontSize: 28 },
  optionInfo: { flex: 1 },
  optionTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600', marginBottom: 2 },
  optionDesc: { ...typography.small, color: colors.text.secondary },
  optionBadge: { backgroundColor: '#F0FFF4', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  optionBadgeText: { ...typography.caption, color: '#16A34A', fontWeight: '700' },
});
