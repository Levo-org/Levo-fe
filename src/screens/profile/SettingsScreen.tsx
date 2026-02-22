import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [vibration, setVibration] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>학습 설정</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="bell" size={18} color="#4B4B4B" />
              <Text style={styles.settingLabel}>학습 알림</Text>
            </View>
            <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: '#E5E5E5', true: '#B8E986' }} thumbColor={notifications ? '#58CC02' : '#f4f3f4'} />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="volume-2" size={18} color="#4B4B4B" />
              <Text style={styles.settingLabel}>효과음</Text>
            </View>
            <Switch value={soundEffects} onValueChange={setSoundEffects} trackColor={{ false: '#E5E5E5', true: '#B8E986' }} thumbColor={soundEffects ? '#58CC02' : '#f4f3f4'} />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Feather name="smartphone" size={18} color="#4B4B4B" />
              <Text style={styles.settingLabel}>진동</Text>
            </View>
            <Switch value={vibration} onValueChange={setVibration} trackColor={{ false: '#E5E5E5', true: '#B8E986' }} thumbColor={vibration ? '#58CC02' : '#f4f3f4'} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>앱 버전</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>빌드 번호</Text>
            <Text style={styles.infoValue}>1</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>법적 고지</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkLabel}>이용약관</Text>
            <Feather name="chevron-right" size={18} color="#AFAFAF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkLabel}>개인정보처리방침</Text>
            <Feather name="chevron-right" size={18} color="#AFAFAF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkLabel}>오픈소스 라이선스</Text>
            <Feather name="chevron-right" size={18} color="#AFAFAF" />
          </TouchableOpacity>
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
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#AFAFAF', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  section: { backgroundColor: '#F7F7F7', borderRadius: 16, paddingHorizontal: 16, marginBottom: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#4B4B4B' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  infoLabel: { fontSize: 15, color: '#4B4B4B' },
  infoValue: { fontSize: 15, color: '#AFAFAF' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#E5E5E5' },
  linkLabel: { fontSize: 15, color: '#4B4B4B' },
});
