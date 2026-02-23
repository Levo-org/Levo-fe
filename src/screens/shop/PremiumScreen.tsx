import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { subscriptionService } from '../../services/subscription.service';
import { useApi } from '../../hooks/useApi';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Premium'>;

interface SubscriptionData {
  isActive: boolean;
  plan?: string;
  expiresAt?: string;
}

const FEATURES = [
  { emoji: '❤️', title: '무제한 하트', desc: '하트 걱정 없이 학습' },
  { emoji: '🚫', title: '광고 제거', desc: '모든 광고 없이 쾌적하게' },
  { emoji: '⚡', title: 'XP 부스트', desc: '항상 1.5배 XP 획득' },
  { emoji: '🛡️', title: '스트릭 보호', desc: '월 2회 자동 보호' },
  { emoji: '📝', title: '추가 퀴즈', desc: '프리미엄 전용 문제' },
  { emoji: '📊', title: '상세 통계', desc: '학습 분석 리포트' },
];

export default function PremiumScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [subscribing, setSubscribing] = useState(false);

  const fetcher = useCallback(() => subscriptionService.getSubscription(), []);
  const { data, loading } = useApi<SubscriptionData>(fetcher);

  const isActive = data?.isActive ?? false;

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const platform = Platform.OS === 'ios' ? 'apple' : 'google';
      const res = await subscriptionService.subscribe(selectedPlan, 'mock_receipt', platform as 'apple' | 'google');
      if (res.data?.success) {
        Alert.alert('구독 완료', '프리미엄 구독이 시작되었습니다! 🎉', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('실패', res.data?.message ?? '구독에 실패했습니다');
      }
    } catch (e: any) {
      Alert.alert('오류', e?.response?.data?.message ?? '구독에 실패했습니다');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (isActive) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>프리미엄</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>👑</Text>
          <Text style={styles.activeTitle}>프리미엄 사용 중</Text>
          <Text style={styles.activeDesc}>
            {data?.plan === 'yearly' ? '연간 구독' : '월간 구독'}
            {data?.expiresAt ? ` · ${new Date(data.expiresAt).toLocaleDateString()}까지` : ''}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>프리미엄</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.hero}>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>Levo 프리미엄</Text>
          <Text style={styles.heroDesc}>더 빠른 학습, 더 많은 기능</Text>
        </Animated.View>

        {/* Features */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.features}>
          {FEATURES.map((f, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Plans */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.plans}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planSelected]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.7}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>인기</Text>
            </View>
            <Text style={styles.planName}>연간</Text>
            <Text style={styles.planPrice}>₩79,900</Text>
            <Text style={styles.planMeta}>월 ₩6,658 · 50% 할인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planSelected]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.7}
          >
            <Text style={styles.planName}>월간</Text>
            <Text style={styles.planPrice}>₩9,900</Text>
            <Text style={styles.planMeta}>매월 결제</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.subscribeBtn}
          onPress={handleSubscribe}
          disabled={subscribing}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeBtnText}>
            {subscribing ? '처리 중...' : `${selectedPlan === 'yearly' ? '연간' : '월간'} 구독 시작`}
          </Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>언제든지 취소 가능</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  hero: { alignItems: 'center', paddingVertical: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { ...typography.h1, color: colors.text.primary, marginBottom: 4 },
  heroDesc: { ...typography.body, color: colors.text.secondary },
  features: { backgroundColor: colors.background.secondary, borderRadius: 20, padding: 20, marginBottom: 24, gap: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureEmoji: { fontSize: 24 },
  featureInfo: { flex: 1 },
  featureTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  featureDesc: { ...typography.small, color: colors.text.secondary },
  plans: { flexDirection: 'row', gap: 12 },
  planCard: { flex: 1, backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  planSelected: { borderColor: colors.primary.main, backgroundColor: colors.primary.light },
  planBadge: { position: 'absolute', top: -10, right: -10, backgroundColor: colors.status.error, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  planBadgeText: { ...typography.small, color: '#FFF', fontWeight: '700', fontSize: 10 },
  planName: { ...typography.caption, color: colors.text.secondary, marginBottom: 4 },
  planPrice: { ...typography.h2, color: colors.text.primary, marginBottom: 4 },
  planMeta: { ...typography.small, color: colors.text.tertiary, textAlign: 'center' },
  footer: { paddingHorizontal: 20, paddingTop: 12 },
  subscribeBtn: { backgroundColor: colors.primary.main, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  subscribeBtnText: { ...typography.button, color: '#FFF', fontSize: 18 },
  disclaimer: { ...typography.small, color: colors.text.tertiary, textAlign: 'center' },
  activeTitle: { ...typography.h2, color: colors.text.primary, marginBottom: 8 },
  activeDesc: { ...typography.body, color: colors.text.secondary },
});
