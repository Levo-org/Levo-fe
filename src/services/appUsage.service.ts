import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_USAGE_KEY = 'levo_app_usage_seconds';

interface AppUsageSnapshot {
  date: string;
  seconds: number;
}

let initialized = false;
let activeStartedAt: number | null = null;
let persistedSnapshot: AppUsageSnapshot = { date: '', seconds: 0 };
let appStateListener: { remove: () => void } | null = null;

const getKSTDate = () => {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().split('T')[0];
};

const loadSnapshot = async (): Promise<AppUsageSnapshot> => {
  try {
    const raw = await AsyncStorage.getItem(APP_USAGE_KEY);
    if (!raw) return { date: getKSTDate(), seconds: 0 };
    const parsed = JSON.parse(raw) as AppUsageSnapshot;
    if (!parsed?.date || typeof parsed.seconds !== 'number') {
      return { date: getKSTDate(), seconds: 0 };
    }
    if (parsed.date !== getKSTDate()) {
      return { date: getKSTDate(), seconds: 0 };
    }
    return parsed;
  } catch {
    return { date: getKSTDate(), seconds: 0 };
  }
};

const persistSnapshot = async () => {
  await AsyncStorage.setItem(APP_USAGE_KEY, JSON.stringify(persistedSnapshot));
};

const rotateIfNeeded = () => {
  const today = getKSTDate();
  if (persistedSnapshot.date !== today) {
    persistedSnapshot = { date: today, seconds: 0 };
  }
};

const flushActiveElapsed = async () => {
  rotateIfNeeded();
  if (!activeStartedAt) return;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - activeStartedAt) / 1000));
  persistedSnapshot.seconds += elapsedSeconds;
  activeStartedAt = null;
  await persistSnapshot();
};

export const initAppUsageTracking = async () => {
  if (initialized) return;

  persistedSnapshot = await loadSnapshot();
  const initialState = AppState.currentState;
  if (initialState === 'active') {
    activeStartedAt = Date.now();
  }

  appStateListener = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
    if (nextState === 'active') {
      rotateIfNeeded();
      if (!activeStartedAt) {
        activeStartedAt = Date.now();
      }
      return;
    }

    await flushActiveElapsed();
  });

  initialized = true;
};

export const getTodayAppUsageSeconds = async () => {
  if (!initialized) {
    await initAppUsageTracking();
  }

  rotateIfNeeded();

  const runningSeconds = activeStartedAt
    ? Math.max(0, Math.floor((Date.now() - activeStartedAt) / 1000))
    : 0;

  return persistedSnapshot.seconds + runningSeconds;
};

export const stopAppUsageTracking = async () => {
  if (!initialized) return;

  await flushActiveElapsed();
  appStateListener?.remove();
  appStateListener = null;
  initialized = false;
};
