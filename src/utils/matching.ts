import { Profile } from '../types';

// "5:30" or "5:30/km" -> 330 seconds per km
export const parsePace = (value?: string): number | null => {
  if (!value) return null;
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

export type PaceMatch = 'great' | 'good' | 'faster' | 'slower' | 'unknown';

// Compare a session's planned pace with the runner's own pace band.
// The comfortable range runs from threshold pace (fastest) to easy pace + 30s (slowest).
export const getPaceMatch = (sessionPace: number, profile?: Profile | null): PaceMatch => {
  const easy = parsePace(profile?.paceBand?.easy);
  const threshold = parsePace(profile?.paceBand?.threshold);
  const mp = parsePace(profile?.paceBand?.mp);
  if (easy === null && threshold === null && mp === null) return 'unknown';

  const anchor = easy ?? mp ?? threshold!;
  const fastest = threshold ?? mp ?? anchor - 30;
  const slowest = (easy ?? anchor) + 30;

  if (Math.abs(sessionPace - anchor) <= 15) return 'great';
  if (sessionPace >= fastest && sessionPace <= slowest) return 'good';
  return sessionPace < fastest ? 'faster' : 'slower';
};

export const paceMatchRank: Record<PaceMatch, number> = {
  great: 0,
  good: 1,
  unknown: 2,
  slower: 3,
  faster: 4,
};

export const paceMatchColor: Record<PaceMatch, string> = {
  great: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  faster: 'bg-orange-100 text-orange-800',
  slower: 'bg-gray-100 text-gray-700',
  unknown: 'bg-gray-100 text-gray-500',
};
