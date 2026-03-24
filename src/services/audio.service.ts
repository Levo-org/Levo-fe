import * as Speech from 'expo-speech';

interface SpeakOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_LANGUAGE = 'en-US';

const mapToSpeechLocale = (language?: string): string => {
  if (!language) return DEFAULT_LANGUAGE;

  if (language.includes('-')) return language;

  if (language === 'ja') return 'ja-JP';
  if (language === 'zh') return 'zh-CN';
  return 'en-US';
};

export const audioService = {
  speak: async (text: string, options: SpeakOptions = {}): Promise<void> => {
    const content = text.trim();
    if (!content) return;

    await Speech.stop();

    Speech.speak(content, {
      language: mapToSpeechLocale(options.language),
      rate: options.rate ?? 0.95,
      pitch: options.pitch ?? 1,
      onDone: options.onDone,
      onStopped: options.onStopped,
      onError: (error) => {
        options.onError?.(error);
      },
    });
  },

  stop: async (): Promise<void> => {
    await Speech.stop();
  },

  isSpeaking: async (): Promise<boolean> => Speech.isSpeakingAsync(),
};
