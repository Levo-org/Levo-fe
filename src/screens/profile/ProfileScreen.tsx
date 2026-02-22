import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useUserStore } from '../../stores/userStore';
import ProgressIndicator from '../../components/ProgressIndicator';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, languageProfile, logout } = useAuthStore();
  const { xp, userLevel, streak } = useUserStore();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>프로필</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <Feather name="settings" size={24} color="#4B4B4B" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || '👤'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || '학습자'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelBadge}>Lv.{userLevel}</Text>
            <View style={styles.xpBar}>
              <ProgressIndicator current={xp % 100} total={100} height={6} color="#58CC02" />
            </View>
            <Text style={styles.xpText}>{xp % 100}/100</Text>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.quickItem}>
            <Text style={styles.quickEmoji}>🔥</Text>
            <Text style={styles.quickValue}>{streak}일</Text>
            <Text style={styles.quickLabel}>스트릭</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.quickItem}>
            <Text style={styles.quickEmoji}>⭐</Text>
            <Text style={styles.quickValue}>{xp}</Text>
            <Text style={styles.quickLabel}>총 XP</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.quickItem}>
            <Text style={styles.quickEmoji}>📚</Text>
            <Text style={styles.quickValue}>24</Text>
            <Text style={styles.quickLabel}>완료 레슨</Text>
          </Animated.View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {[
            { icon: 'globe' as const, label: '학습 언어', value: languageProfile?.targetLanguage === 'english' ? '영어 🇺🇸' : languageProfile?.targetLanguage === 'japanese' ? '일본어 🇯🇵' : '중국어 🇨🇳', onPress: () => {} },
              { icon: 'target' as const, label: '일일 목표', value: `${user?.settings?.dailyGoalMinutes || 10}분`, onPress: () => {} },
            { icon: 'shield' as const, label: '프리미엄', value: '', onPress: () => navigation.navigate('Premium') },
            { icon: 'shopping-bag' as const, label: '코인 상점', value: '', onPress: () => navigation.navigate('CoinShop') },
            { icon: 'heart' as const, label: '하트', value: '', onPress: () => navigation.navigate('HeartsDemo') },
          ].map((item, idx) => (
            <Animated.View key={item.label} entering={FadeInDown.delay(400 + idx * 60).duration(400)}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                <Feather name={item.icon} size={20} color="#4B4B4B" />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuValue}>{item.value}</Text>
                <Feather name="chevron-right" size={18} color="#AFAFAF" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Feather name="log-out" size={18} color="#FF4B4B" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 0, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#4B4B4B' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  profileCard: { alignItems: 'center', backgroundColor: '#F7F7F7', borderRadius: 20, padding: 24, marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#58CC02', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  userName: { fontSize: 20, fontWeight: '800', color: '#4B4B4B' },
  userEmail: { fontSize: 13, color: '#AFAFAF', marginBottom: 12 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  levelBadge: { fontSize: 13, fontWeight: '800', color: '#58CC02', backgroundColor: '#E8F7E0', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  xpBar: { flex: 1 },
  xpText: { fontSize: 11, color: '#AFAFAF', width: 42, textAlign: 'right' },
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  quickItem: { flex: 1, backgroundColor: '#F7F7F7', borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 },
  quickEmoji: { fontSize: 20 },
  quickValue: { fontSize: 18, fontWeight: '800', color: '#4B4B4B' },
  quickLabel: { fontSize: 11, color: '#AFAFAF' },
  menu: { gap: 2, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#4B4B4B', flex: 1 },
  menuValue: { fontSize: 14, color: '#AFAFAF', marginRight: 4 },
  logoutButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#FFEBEE' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#FF4B4B' },
});
