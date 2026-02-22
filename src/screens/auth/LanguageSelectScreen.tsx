import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../types';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import BackButton from '../../components/BackButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'LanguageSelect'>;

const LANGUAGES = [
  { id: 'english', flag: '🇺🇸', name: '영어', sub: 'English' },
  { id: 'japanese', flag: '🇯🇵', name: '일본어', sub: 'Japanese' },
  { id: 'chinese', flag: '🇨🇳', name: '중국어', sub: 'Chinese' },
];

export default function LanguageSelectScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { setTargetLanguage } = useOnboardingStore();

  const handleNext = () => {
    if (selected) {
      setTargetLanguage(selected);
      navigation.navigate('LevelSelect');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.content}>
        <Animated.Text entering={FadeInDown.duration(500)} style={styles.title}>
          어떤 언어를{'\n'}배우고 싶나요?
        </Animated.Text>

        <View style={styles.options}>
          {LANGUAGES.map((lang, index) => (
            <Animated.View key={lang.id} entering={FadeInDown.delay(200 + index * 100).duration(500)}>
              <TouchableOpacity
                style={[
                  styles.card,
                  selected === lang.id && styles.cardSelected,
                ]}
                onPress={() => setSelected(lang.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{lang.flag}</Text>
                <View style={styles.cardText}>
                  <Text style={[styles.langName, selected === lang.id && styles.langNameSelected]}>
                    {lang.name}
                  </Text>
                  <Text style={styles.langSub}>{lang.sub}</Text>
                </View>
                {selected === lang.id && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, !selected && styles.nextButtonTextDisabled]}>
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary.main,
    backgroundColor: '#F0FFF0',
  },
  flag: {
    fontSize: 40,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  langName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  langNameSelected: {
    color: colors.primary.main,
  },
  langSub: {
    ...typography.small,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
  },
  nextButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.background.tertiary,
  },
  nextButtonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: colors.text.secondary,
  },
});
