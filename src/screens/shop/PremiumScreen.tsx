import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Premium'>;

const FEATURES = [
  { emoji: '❤️', title: '무제한 하트', desc: '하트 걱정 없이 학습하세요' },
  { emoji: '🚫', title: '광고 제거', desc: '방해 없는 학습 환경' },
  { emoji: '🛡️', title: '무료 스트릭 실드', desc: '매월 스트릭 실드 2개 지급' },
  { emoji: '⚡', title: 'XP 부스트', desc: '항상 XP 1.5배 획득' },
  { emoji: '📚', title: '프리미엄 콘텐츠', desc: '독점 레슨과 학습 자료' },
  { emoji: '🎯', title: '상세 분석', desc: '학습 패턴과 취약점 분석' },
];

export default function PremiumScreen({ navigation }: Props) {
  const handleSubscribe = (plan: string) => {
    Alert.alert('구독', `${plan} 구독을 시작하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '구독', onPress: () => {} },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton color="#FFFFFF" />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroSection}>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>LEVO Premium</Text>
          <Text style={styles.heroDesc}>더 빠르고 효과적인 학습을 경험하세요</Text>
        </Animated.View>

        <View style={styles.features}>
          {FEATURES.map((feat, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(200 + idx * 60).duration(400)} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{feat.emoji}</Text>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.plans}>
          <TouchableOpacity
            style={[styles.planCard, styles.yearlyPlan]}
            onPress={() => handleSubscribe('연간')}
            activeOpacity={0.8}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>33% 할인</Text>
            </View>
            <Text style={styles.planTitle}>연간 플랜</Text>
            <Text style={styles.planPrice}>₩79,900/년</Text>
            <Text style={styles.planSub}>월 ₩6,658</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleSubscribe('월간')}
            activeOpacity={0.8}
          >
            <Text style={styles.planTitle}>월간 플랜</Text>
            <Text style={styles.planPrice}>₩9,900/월</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.legalText}>
          구독은 자동으로 갱신됩니다. 언제든지 취소할 수 있습니다.
        </Text>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CE82FF' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', paddingTop: 12, paddingBottom: 32 },
  heroEmoji: { fontSize: 64, marginBottom: 12 },
  heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  heroDesc: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  features: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20, gap: 16, marginBottom: 24 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureEmoji: { fontSize: 24 },
  featureInfo: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  plans: { gap: 12, marginBottom: 16 },
  planCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  yearlyPlan: { borderColor: '#FFC800', backgroundColor: 'rgba(255,255,255,0.25)' },
  saveBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: '#FFC800', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 8 },
  saveText: { fontSize: 11, fontWeight: '800', color: '#4B4B4B' },
  planTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  planPrice: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  planSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  legalText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
});
