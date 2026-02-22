export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
}

export function getLanguageFlag(lang: string): string {
  const flags: Record<string, string> = {
    en: '🇺🇸',
    ja: '🇯🇵',
    zh: '🇨🇳',
    english: '🇺🇸',
    japanese: '🇯🇵',
    chinese: '🇨🇳',
  };
  return flags[lang] || '🌐';
}

export function getLevelEmoji(level: string): string {
  const emojis: Record<string, string> = {
    beginner: '🌱',
    elementary: '📗',
    intermediate: '📘',
    advanced: '📙',
  };
  return emojis[level] || '📖';
}
