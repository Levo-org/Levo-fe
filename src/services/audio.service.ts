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

export interface SpeechDebugInfo {
  requestedLocale: string;
  voicesTotal: number;
  matchedVoiceId: string | null;
  matchedVoiceLanguage: string | null;
  speakingNow: boolean;
  transport: 'remote-stream-first';
}

const DEFAULT_LOCALE = 'en-US';
const REMOTE_CHUNK_LIMIT = 170;
const START_DETECTION_DELAY_MS = 450;
const NOVELTY_VOICE_KEYWORDS = ['trinoids', 'zarvox', 'whisper', 'goodnews', 'badnews', 'bells'];

let audioModeInitialized = false;
let availableVoices: Speech.Voice[] | null = null;
let activeSound: Audio.Sound | null = null;
let playSessionId = 0;

type ExtendedSpeechOptions = Speech.SpeechOptions & {
  useApplicationAudioSession?: boolean;
};

const mapToSpeechLocale = (language?: string): string => {
  if (!language) return DEFAULT_LOCALE;
  if (language.includes('-')) return language;
  if (language === 'ja') return 'ja-JP';
  if (language === 'zh') return 'zh-CN';
  return 'en-US';
};

const mapToRemoteLanguage = (locale: string): string => {
  const normalized = locale.toLowerCase();
  if (normalized.startsWith('ja')) return 'ja';
  if (normalized.startsWith('zh')) return 'zh-CN';
  return 'en';
};

const splitIntoChunks = (text: string, maxLength: number): string[] => {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const chunks: string[] = [];
  let current = '';

  for (const token of tokens) {
    if (token.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = '';
      }

      let index = 0;
      while (index < token.length) {
        chunks.push(token.slice(index, index + maxLength));
        index += maxLength;
      }
      continue;
    }

    if (!current) {
      current = token;
      continue;
    }

    if ((current.length + 1 + token.length) <= maxLength) {
      current = `${current} ${token}`;
    } else {
      chunks.push(current);
      current = token;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
};

const buildRemoteTtsUrl = (text: string, locale: string): string => {
  const tl = mapToRemoteLanguage(locale);
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;
};

const ensureAudioMode = async (): Promise<void> => {
  if (audioModeInitialized) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: false,
  });
  audioModeInitialized = true;
};

const disposeSound = async (): Promise<void> => {
  if (!activeSound) return;
  const sound = activeSound;
  activeSound = null;
  await sound.unloadAsync();
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

  const isNovelty = (voice: Speech.Voice): boolean => {
    const signature = `${voice.identifier || ''} ${voice.name || ''}`.toLowerCase();
    return NOVELTY_VOICE_KEYWORDS.some((keyword) => signature.includes(keyword));
  };

  const scoreVoice = (voice: Speech.Voice): number => {
    let score = 0;
    if (!isNovelty(voice)) score += 10;
    if ((voice.quality || '').toLowerCase() === 'enhanced') score += 3;
    if ((voice.quality || '').toLowerCase() === 'default') score += 2;
    return score;
  };

  const pickBest = (list: Speech.Voice[]) =>
    [...list].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;

  const exact = pickBest(voices.filter((voice) => voice.language?.toLowerCase() === locale.toLowerCase()));
  if (exact) return exact;

  const sameLanguage = pickBest(
    voices.filter((voice) => voice.language?.toLowerCase().startsWith(`${languagePrefix}-`)),
  );
  if (sameLanguage) return sameLanguage;

  return pickBest(voices.filter((voice) => voice.language?.toLowerCase().startsWith('en-'))) || voices[0];
};

const runExpoSpeech = async (
  content: string,
  locale: string,
  preferredVoice: Speech.Voice | null,
  options: SpeakOptions,
): Promise<void> => {
  const runSpeech = (params: { language: string; voice?: string; useApplicationAudioSession?: boolean }) =>
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

      const speechOptions: ExtendedSpeechOptions = {
        language: params.language,
        voice: params.voice,
        useApplicationAudioSession: params.useApplicationAudioSession,
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
      };

      Speech.speak(content, speechOptions);
    });

  await runSpeech({
    language: preferredVoice?.language || locale,
    voice: preferredVoice?.identifier,
    useApplicationAudioSession: false,
  });
};

const runRemoteTtsStream = async (
  content: string,
  locale: string,
  sessionId: number,
  options: SpeakOptions,
): Promise<void> => {
  const chunks = splitIntoChunks(content, REMOTE_CHUNK_LIMIT);
  if (chunks.length === 0) {
    throw new Error('Remote TTS text is empty');
  }

  for (const chunk of chunks) {
    if (sessionId !== playSessionId) {
      options.onStopped?.();
      return;
    }

    const uri = buildRemoteTtsUrl(chunk, locale);
    await new Promise<void>((resolve, reject) => {
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

      Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0, progressUpdateIntervalMillis: 150 },
        (status) => {
          if (!status.isLoaded) {
            if ('error' in status && status.error) {
              disposeSound().catch(() => undefined);
              settleReject(new Error(status.error));
            }
            return;
          }

          if (sessionId !== playSessionId) {
            disposeSound().catch(() => undefined);
            settleResolve();
            return;
          }

          if (status.didJustFinish) {
            disposeSound().catch(() => undefined);
            settleResolve();
          }
        },
      )
        .then(({ sound }) => {
          activeSound = sound;
        })
        .catch((error) => {
          disposeSound().catch(() => undefined);
          settleReject(error instanceof Error ? error : new Error('Remote TTS playback failed'));
        });
    });
  }

  if (sessionId === playSessionId) {
    options.onDone?.();
  }
};

export const audioService = {
  speak: async (text: string, options: SpeakOptions = {}): Promise<void> => {
    const content = text.trim();
    if (!content) {
      throw new Error('Speech text is empty');
    }

    await ensureAudioMode();

    playSessionId += 1;
    const sessionId = playSessionId;

    await Speech.stop();
    await disposeSound();

    const locale = mapToSpeechLocale(options.language);
    const preferredVoice = await getPreferredVoice(options.language);

    try {
      await runRemoteTtsStream(content, locale, sessionId, options);
      return;
    } catch {
      try {
        await runExpoSpeech(content, locale, preferredVoice, options);
        return;
      } catch (error) {
        options.onError?.(error as Error);
        throw error;
      }
    }
  },

  stop: async (): Promise<void> => {
    playSessionId += 1;
    await Speech.stop();
    await disposeSound();
  },

  isSpeaking: async (): Promise<boolean> => {
    if (activeSound) {
      const status = await activeSound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        return true;
      }
    }
    return Speech.isSpeakingAsync();
  },

  getSpeechDebugInfo: async (language?: string): Promise<SpeechDebugInfo> => {
    const locale = mapToSpeechLocale(language);
    const voices = await getVoices();
    const preferredVoice = await getPreferredVoice(language);
    const speakingNow = await audioService.isSpeaking();

    return {
      requestedLocale: locale,
      voicesTotal: voices.length,
      matchedVoiceId: preferredVoice?.identifier || null,
      matchedVoiceLanguage: preferredVoice?.language || null,
      speakingNow,
      transport: 'remote-stream-first',
    };
  },
};
