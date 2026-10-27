import React from 'react';
import { Event } from '../../types';
import { formatDistance, formatKmAway, formatPace, formatSessionTime } from '../../utils/formatters';
import { paceMatchColor, type PaceMatch } from '../../utils/matching';
import { useI18n } from '../../i18n/context';

interface EventCardProps {
  event: Event;
  match: PaceMatch;
  distanceKm?: number;
  isMine?: boolean;
  onOpen: (eventId: string) => void;
}

// Card for a group run session in the feed: title, when/where, and the run itself
const EventCard: React.FC<EventCardProps> = ({ event, match, distanceKm, isMine, onOpen }) => {
  const { lang, t } = useI18n();
  const isFull = !!event.capacity && event.stats.attendees >= event.capacity;
  // Only positive matches get a badge; the rest would just be noise
  const showMatch = !isMine && (match === 'great' || match === 'good');

  const where = [event.meetPointLabel || t('card.meetPointDefault'), distanceKm !== undefined && formatKmAway(distanceKm, lang)]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      onClick={() => onOpen(event.id)}
      className="w-full text-left bg-white rounded-xl border border-gray-200 px-4 py-3 hover:border-blue-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
        {isMine && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex-shrink-0">
            {t('card.going')}
          </span>
        )}
        {showMatch && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${paceMatchColor[match]}`}>
            {t(`match.${match}`)}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1 truncate">
        {formatSessionTime(event.scheduledAt, lang)} · {where}
      </p>
      <p className="text-sm text-gray-900 mt-1">
        {formatDistance(event.distancePlanKm)} · {formatPace(event.pacePlanSecPerKm)} ·{' '}
        <span className={isFull ? 'text-red-600 font-medium' : ''}>
          {isFull
            ? t('card.full')
            : t('card.attendees', {
                n: event.stats.attendees,
                cap: event.capacity ? `/${event.capacity}` : '',
              })}
        </span>
      </p>
    </button>
  );
};

export default EventCard;
