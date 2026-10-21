import { LOCALES, translate, type Lang } from '../i18n/strings';

export const formatPace = (secondsPerKm: number): string => {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDistance = (km: number): string => {
  return `${km.toFixed(1)}km`;
};

export const formatTime = (timestamp: string, lang: Lang = 'en'): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return translate(lang, 'time.justNow');
  } else if (diffHours < 24) {
    return translate(lang, 'time.hoursAgo', { n: diffHours });
  } else {
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return translate(lang, 'time.yesterday');
    } else if (diffDays < 7) {
      return translate(lang, 'time.daysAgo', { n: diffDays });
    } else {
      return date.toLocaleDateString(LOCALES[lang]);
    }
  }
};

export const getIntensityColor = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'hard':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'workout':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'race':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getIntensityLabel = (intensity: string): string => {
  switch (intensity) {
    case 'easy':
      return 'Easy Run';
    case 'moderate':
      return 'Moderate';
    case 'hard':
      return 'Hard Run';
    case 'workout':
      return 'Workout';
    case 'race':
      return 'Race';
    default:
      return intensity;
  }
};
export const formatSessionTime = (timestamp: string, lang: Lang = 'en'): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  const locale = LOCALES[lang];

  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return translate(lang, 'time.today', { time });
  } else if (isTomorrow) {
    return translate(lang, 'time.tomorrow', { time });
  } else {
    const day = date.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
    return translate(lang, 'time.dateAt', { date: day, time });
  }
};

export const formatKmAway = (km: number, lang: Lang = 'en'): string => {
  return km < 1
    ? translate(lang, 'distance.metersAway', { n: Math.round(km * 1000) })
    : translate(lang, 'distance.kmAway', { n: km.toFixed(1) });
};
