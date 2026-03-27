import * as Speech from 'expo-speech';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

interface SpeakOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_LANGUAGE = 'en-US';
let audioModeInitialized = false;

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

    if (!audioModeInitialized) {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
      });
      audioModeInitialized = true;
    }

    await Speech.stop();

    Speech.speak(content, {
      language: mapToSpeechLocale(options.language),
      rate: options.rate ?? 0.95,
      pitch: options.pitch ?? 1,
      volume: 1,
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
