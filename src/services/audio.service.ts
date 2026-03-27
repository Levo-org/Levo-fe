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
const NOVELTY_VOICE_KEYWORDS = ['trinoids', 'zarvox', 'whisper', 'goodnews', 'badnews', 'bells'];
const START_DETECTION_DELAY_MS = 350;

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
  const isNoveltyVoice = (voice: Speech.Voice): boolean => {
    const signature = `${voice.identifier || ''} ${voice.name || ''}`.toLowerCase();
    return NOVELTY_VOICE_KEYWORDS.some((keyword) => signature.includes(keyword));
  };
  const preferNaturalVoice = (voice: Speech.Voice): number => {
    let score = 0;
    if (!isNoveltyVoice(voice)) score += 10;
    if ((voice.quality || '').toLowerCase() === 'enhanced') score += 3;
    if ((voice.quality || '').toLowerCase() === 'default') score += 2;
    if ((voice.name || '').toLowerCase().includes('compact')) score -= 1;
    return score;
  };
  const sortByNaturalVoice = (list: Speech.Voice[]) =>
    [...list].sort((a, b) => preferNaturalVoice(b) - preferNaturalVoice(a));

  const exact = sortByNaturalVoice(
    voices.filter((voice) => voice.language?.toLowerCase() === locale.toLowerCase()),
  )[0];
  if (exact) return exact;

  const sameLanguage = sortByNaturalVoice(
    voices.filter((voice) => voice.language?.toLowerCase().startsWith(`${languagePrefix}-`)),
  )[0];
  if (sameLanguage) return sameLanguage;

  const defaultVoice = sortByNaturalVoice(
    voices.filter((voice) => voice.language?.toLowerCase().startsWith('en-')),
  )[0];
  return defaultVoice || voices[0] || null;
};

export interface SpeechDebugInfo {
  requestedLocale: string;
  voicesTotal: number;
  matchedVoiceId: string | null;
  matchedVoiceLanguage: string | null;
  speakingNow: boolean;
}

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
        let settled = false;
        const settleResolve = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        const settleReject = (error: Error) => {
          if (settled) return;
          settled = true;
          reject(error);
        };

        const startCheck = setTimeout(() => {
          Speech.isSpeakingAsync()
            .then((speaking) => {
              if (!speaking) {
                settleReject(new Error('Speech did not start'));
              }
            })
            .catch(() => {
              settleReject(new Error('Unable to verify speech state'));
            });
        }, START_DETECTION_DELAY_MS);

        Speech.speak(content, {
          language: params.language,
          voice: params.voice,
          rate: options.rate ?? 0.95,
          pitch: options.pitch ?? 1,
          volume: 1,
          onDone: () => {
            clearTimeout(startCheck);
            options.onDone?.();
            settleResolve();
          },
          onStopped: () => {
            clearTimeout(startCheck);
            options.onStopped?.();
            settleResolve();
          },
          onError: (error) => {
            clearTimeout(startCheck);
            settleReject(error instanceof Error ? error : new Error('Speech failed'));
          },
        });
      });

    try {
      await runSpeech({ language: preferredVoice?.language || locale, voice: preferredVoice?.identifier });
    } catch {
      try {
        await runSpeech({ language: locale });
      } catch (fallbackError) {
        try {
          await runSpeech({ language: DEFAULT_LANGUAGE });
        } catch {
          options.onError?.(fallbackError as Error);
          throw fallbackError;
        }
      }
    }
  },

  stop: async (): Promise<void> => {
    await Speech.stop();
  },

  isSpeaking: async (): Promise<boolean> => Speech.isSpeakingAsync(),

  getSpeechDebugInfo: async (language?: string): Promise<SpeechDebugInfo> => {
    const locale = mapToSpeechLocale(language);
    const voices = await getVoices();
    const preferredVoice = await getPreferredVoice(language);
    const speakingNow = await Speech.isSpeakingAsync();

    return {
      requestedLocale: locale,
      voicesTotal: voices.length,
      matchedVoiceId: preferredVoice?.identifier || null,
      matchedVoiceLanguage: preferredVoice?.language || null,
      speakingNow,
    };
  },
};
