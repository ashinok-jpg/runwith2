import React, { useMemo, useState } from 'react';
import { MapPin, Plus, Target } from 'lucide-react';
import EventCard from '../cards/EventCard';
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

type Filter = 'recommended' | 'matches' | 'today' | 'week';

const filters: { id: Filter; label: MessageKey }[] = [
  { id: 'recommended', label: 'feed.filter.recommended' },
  { id: 'matches', label: 'feed.filter.matches' },
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

    const scored = sessions
      .filter(s => !myIds.has(s.id))
      .map(s => ({ session: s, match: getPaceMatch(s.pacePlanSecPerKm, profile) }));

    const filtered = scored.filter(({ session, match }) => {
      const t = new Date(session.scheduledAt).getTime();
      if (filter === 'matches') return match === 'great' || match === 'good';
      if (filter === 'today') return t < endOfToday;
      if (filter === 'week') return t < endOfWeek;
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
    <div className="max-w-md mx-auto px-4 py-4 mb-24">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-500" />
          <span>{locationText}</span>
        </div>
        <label className="flex items-center space-x-1 text-sm text-gray-600">
          <span>{t('feed.within')}</span>
          <select
            value={radiusKm}
            onChange={e => setRadiusKm(Number(e.target.value))}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm"
          >
            {radiusOptions.map(r => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </label>
      </div>

      {!hasPace && (
        <button
          onClick={onEditProfile}
          className="w-full flex items-center space-x-3 text-left bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-4 mb-4"
        >
          <Target size={22} className="text-green-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-gray-900 text-sm">{t('feed.setPaceTitle')}</div>
            <div className="text-sm text-gray-600">{t('feed.setPaceBody')}</div>
          </div>
        </button>
      )}

      {mySessions.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('feed.mine')}</h2>
          <div className="space-y-3">
            {mySessions.map(s => (
              <EventCard key={s.id} event={s} match="unknown" isMine onOpen={onOpenSession} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('feed.nearby')}</h2>
        <div className="flex space-x-2 overflow-x-auto pb-3 -mx-4 px-4">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t(f.label)}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{t('feed.loadError')}</p>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-28" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center bg-white rounded-xl border border-dashed border-gray-200 py-10 px-6">
            <p className="font-medium text-gray-900">{t('feed.emptyTitle')}</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'recommended' ? t('feed.emptyFirst') : t('feed.emptyFilter')}
            </p>
            <button
              onClick={onCreateSession}
              className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold hover:bg-blue-600"
            >
              {t('feed.create')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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

      <button
        onClick={onCreateSession}
        aria-label={t('feed.create')}
        className="fixed bottom-6 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center z-40"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Feed;
