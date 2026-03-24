import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import BackButton from '../../components/BackButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface AttributionItem {
  name: string;
  license: string;
  usage: string;
  url: string;
}

const ATTRIBUTIONS: AttributionItem[] = [
  {
    name: 'Open English WordNet (OEWN)',
    license: 'CC BY 4.0',
    usage: 'English vocabulary and lexical metadata.',
    url: 'https://en-word.net/',
  },
  {
    name: 'JMdict',
    license: 'CC BY-SA 3.0',
    usage: 'Japanese vocabulary and dictionary entries.',
    url: 'https://www.edrdg.org/jmdict/j_jmdict.html',
  },
  {
    name: 'CC-CEDICT',
    license: 'CC BY-SA 4.0',
    usage: 'Chinese vocabulary and dictionary entries.',
    url: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
  },
  {
    name: 'Tatoeba Sentences',
    license: 'CC0 1.0',
    usage: 'Reading and listening sentence examples.',
    url: 'https://tatoeba.org/en/downloads',
  },
];

export default function SourcesCreditsScreen() {
  const insets = useSafeAreaInsets();

  const handleOpenUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      return;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>출처 및 크레딧</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>데이터 사용 고지</Text>
          <Text style={styles.summaryText}>
            Levo는 상업 사용 가능한 공개 데이터셋을 기반으로 학습 콘텐츠를 구성합니다.
            CC BY/CC BY-SA 라이선스의 경우 원저작자 고지와 동일조건 변경허락 의무를 준수합니다.
          </Text>
        </View>

        {ATTRIBUTIONS.map((item) => (
          <View key={item.name} style={styles.itemCard}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseText}>{item.license}</Text>
              </View>
            </View>
            <Text style={styles.itemUsage}>{item.usage}</Text>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenUrl(item.url)}
              activeOpacity={0.75}
            >
              <Feather name="external-link" size={14} color={colors.accent.blue} />
              <Text style={styles.linkText}>{item.url}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.footerNote}>
          번역 보강은 Papago 기반 기계 번역 백필 파이프라인을 통해 생성되며, 음성 학습은 디바이스 TTS를 사용합니다.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  headerSpacer: { width: 32 },
  content: { paddingHorizontal: 20, paddingBottom: 36, gap: 12 },
  summaryCard: {
    backgroundColor: '#EDF7FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D7ECFF',
  },
  summaryTitle: { ...typography.body, fontWeight: '700', color: colors.accent.blue, marginBottom: 8 },
  summaryText: { ...typography.small, color: colors.text.secondary, lineHeight: 20 },
  itemCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: 8,
  },
  itemHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  itemName: { ...typography.body, color: colors.text.primary, fontWeight: '700', flex: 1 },
  licenseBadge: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  licenseText: { ...typography.caption, color: colors.text.secondary, fontWeight: '700' },
  itemUsage: { ...typography.small, color: colors.text.secondary },
  linkButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  linkText: { ...typography.caption, color: colors.accent.blue },
  footerNote: {
    ...typography.small,
    color: colors.text.tertiary,
    marginTop: 6,
    lineHeight: 18,
  },
});
