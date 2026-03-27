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
let availableVoices: Speech.Voice[] | null = null;

const mapToSpeechLocale = (language?: string): string => {
  if (!language) return DEFAULT_LANGUAGE;

  if (language.includes('-')) return language;

  if (language === 'ja') return 'ja-JP';
  if (language === 'zh') return 'zh-CN';
  return 'en-US';
};

const getVoices = async (): Promise<Speech.Voice[]> => {
  if (availableVoices) return availableVoices;
  availableVoices = await Speech.getAvailableVoicesAsync();
  return availableVoices;
};

const getPreferredVoice = async (language?: string): Promise<Speech.Voice | null> => {
  const voices = await getVoices();
  if (voices.length === 0) return null;

  const locale = mapToSpeechLocale(language);
  const languagePrefix = locale.split('-')[0];

  const exact = voices.find((voice) => voice.language?.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;

  const sameLanguage = voices.find((voice) => voice.language?.toLowerCase().startsWith(`${languagePrefix}-`));
  if (sameLanguage) return sameLanguage;

  const defaultVoice = voices.find((voice) => voice.language?.toLowerCase().startsWith('en-'));
  return defaultVoice || voices[0] || null;
};

export const audioService = {
  speak: async (text: string, options: SpeakOptions = {}): Promise<void> => {
    const content = text.trim();
    if (!content) {
      throw new Error('Speech text is empty');
    }

    await Speech.stop();

    const preferredVoice = await getPreferredVoice(options.language);
    const locale = mapToSpeechLocale(options.language);

    const runSpeech = (params: { language: string; voice?: string }) =>
      new Promise<void>((resolve, reject) => {
        Speech.speak(content, {
          language: params.language,
          voice: params.voice,
          rate: options.rate ?? 0.95,
          pitch: options.pitch ?? 1,
          volume: 1,
          onDone: () => {
            options.onDone?.();
            resolve();
          },
          onStopped: () => {
            options.onStopped?.();
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        });
      });

    try {
      await runSpeech({ language: preferredVoice?.language || locale, voice: preferredVoice?.identifier });
    } catch {
      try {
        await runSpeech({ language: locale });
      } catch (fallbackError) {
        options.onError?.(fallbackError as Error);
        throw fallbackError;
      }
    }
  },

  stop: async (): Promise<void> => {
    await Speech.stop();
  },

  isSpeaking: async (): Promise<boolean> => Speech.isSpeakingAsync(),
};
