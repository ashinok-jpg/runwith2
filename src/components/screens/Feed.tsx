import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import EventCard from '../cards/EventCard';
import InstallHint from '../common/InstallHint';
import { useAuth } from '../../lib/authContext';
import { DEFAULT_LOCATION, type LatLng, type LocationStatus } from '../../lib/geo';
import { useMySessions, useNearbySessions } from '../../lib/sessions';
import { getPaceMatch, paceMatchRank } from '../../utils/matching';
import { useI18n } from '../../i18n/context';
import type { MessageKey } from '../../i18n/strings';

interface FeedProps {
  userLocation: LatLng | null;
  locationStatus: LocationStatus;
  onOpenSession: (eventId: string) => void;
  onCreateSession: () => void;
  onEditProfile: () => void;
}

type Filter = 'recommended' | 'today' | 'week';

const filters: { id: Filter; label: MessageKey }[] = [
  { id: 'recommended', label: 'feed.filter.recommended' },
  { id: 'today', label: 'feed.filter.today' },
  { id: 'week', label: 'feed.filter.week' },
];

const radiusOptions = [3, 5, 10, 25];

const Feed: React.FC<FeedProps> = ({ userLocation, locationStatus, onOpenSession, onCreateSession, onEditProfile }) => {
  const { user, profile } = useAuth();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('recommended');
  const [radiusKm, setRadiusKm] = useState(10);
  const center = userLocation ?? (locationStatus === 'locating' ? null : DEFAULT_LOCATION);
  const { sessions, loading, error } = useNearbySessions(center, radiusKm);
  const mySessions = useMySessions(user?.uid ?? null);
  const hasPace = !!(profile?.paceBand?.easy || profile?.paceBand?.mp || profile?.paceBand?.threshold);

  const myIds = useMemo(() => new Set(mySessions.map(s => s.id)), [mySessions]);

  const items = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const endOfWeek = now.getTime() + 7 * 24 * 60 * 60 * 1000;

    const filtered = sessions
      .filter(s => !myIds.has(s.id))
      .map(s => ({ session: s, match: getPaceMatch(s.pacePlanSecPerKm, profile) }))
      .filter(({ session }) => {
        const time = new Date(session.scheduledAt).getTime();
        if (filter === 'today') return time < endOfToday;
        if (filter === 'week') return time < endOfWeek;
        return true;
      });

    if (filter === 'recommended') {
      // Best pace match first, then soonest
      filtered.sort(
        (a, b) =>
          paceMatchRank[a.match] - paceMatchRank[b.match] ||
          a.session.scheduledAt.localeCompare(b.session.scheduledAt)
      );
    }
    return filtered;
  }, [sessions, myIds, profile, filter]);

  const locationText = userLocation
    ? t('feed.nearYou')
    : locationStatus === 'locating'
      ? t('feed.locating')
      : t('feed.nearDefault');

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('feed.nearby')}</h1>
        <button
          onClick={onCreateSession}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>{t('feed.createShort')}</span>
        </button>
      </div>

      <label className="mt-1 inline-flex items-center text-sm text-gray-500">
        <span>{locationText} ·</span>
        <select
          value={radiusKm}
          onChange={e => setRadiusKm(Number(e.target.value))}
          aria-label={t('feed.within')}
          className="ml-1 bg-transparent text-gray-700 font-medium focus:outline-none cursor-pointer"
        >
          {radiusOptions.map(r => (
            <option key={r} value={r}>
              {t('feed.radius', { n: r })}
            </option>
          ))}
        </select>
      </label>

      <InstallHint className="mt-4" />

      {!hasPace && (
        <button
          onClick={onEditProfile}
          className="mt-4 w-full flex items-center justify-between text-left text-sm text-blue-700 bg-blue-50 rounded-xl px-4 py-3"
        >
          <span>{t('feed.setPaceHint')}</span>
          <ChevronRight size={16} className="flex-shrink-0" />
        </button>
      )}

      {mySessions.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">{t('feed.mine')}</h2>
          <div className="space-y-2">
            {mySessions.map(s => (
              <EventCard key={s.id} event={s} match="unknown" isMine onOpen={onOpenSession} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="flex space-x-2 mb-3" role="tablist">
          {filters.map(f => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.id ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{t('feed.loadError')}</p>}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 px-4 py-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 mt-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-medium text-gray-900">{t('feed.emptyTitle')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'recommended' ? t('feed.emptyFirst') : t('feed.emptyFilter')}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(({ session, match }) => (
              <EventCard
                key={session.id}
                event={session}
                match={match}
                distanceKm={userLocation ? session.distanceKm : undefined}
                onOpen={onOpenSession}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Feed;
