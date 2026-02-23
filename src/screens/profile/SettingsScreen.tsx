import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';
import { userService } from '../../services/user.service';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load settings from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await userService.getMe();
        if (res.data?.success) {
          const s = (res.data.data as any)?.user?.settings;
          if (s) {
            setNotifications(s.notifications ?? true);
            setSound(s.sound ?? true);
            setDarkMode(s.darkMode ?? false);
          }
        }
      } catch { /* use defaults */ }
    };
    load();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    try {
      await userService.updateSettings({ [key]: value } as any);
    } catch { /* local state is already updated */ }
  };

  const toggleNotifications = (v: boolean) => {
    setNotifications(v);
    updateSetting('notifications', v);
  };

  const toggleSound = (v: boolean) => {
    setSound(v);
    updateSetting('sound', v);
  };

  const toggleDarkMode = (v: boolean) => {
    setDarkMode(v);
    updateSetting('darkMode', v);
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <Text style={styles.sectionTitle}>알림</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Feather name="bell" size={20} color={colors.text.primary} />
            <Text style={styles.rowLabel}>푸시 알림</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
            />
          </View>
          <View style={styles.row}>
            <Feather name="volume-2" size={20} color={colors.text.primary} />
            <Text style={styles.rowLabel}>효과음</Text>
            <Switch
              value={sound}
              onValueChange={toggleSound}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
            />
          </View>
        </View>

        {/* Display */}
        <Text style={styles.sectionTitle}>화면</Text>
        <View style={styles.section}>
          <View style={styles.row}>
            <Feather name="moon" size={20} color={colors.text.primary} />
            <Text style={styles.rowLabel}>다크 모드</Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: colors.border.light, true: colors.primary.main }}
            />
          </View>
        </View>

        {/* Subscription */}
        <Text style={styles.sectionTitle}>구독</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Premium')}>
            <Text style={{ fontSize: 18 }}>👑</Text>
            <Text style={styles.rowLabel}>프리미엄 구독</Text>
            <Feather name="chevron-right" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={colors.status.error} />
            <Text style={[styles.rowLabel, { color: colors.status.error }]}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Levo v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { ...typography.caption, color: colors.text.tertiary, textTransform: 'uppercase', marginBottom: 8, marginTop: 20, letterSpacing: 1 },
  section: { backgroundColor: colors.background.secondary, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  rowLabel: { flex: 1, ...typography.body, color: colors.text.primary },
  appInfo: { alignItems: 'center', marginTop: 40 },
  appInfoText: { ...typography.small, color: colors.text.tertiary },
});
