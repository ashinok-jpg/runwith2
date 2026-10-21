import React from 'react';
import { Calendar, MapPin, Route, Timer, Users } from 'lucide-react';
import Avatar from '../common/Avatar';
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

// Card for a group run session in the feed
const EventCard: React.FC<EventCardProps> = ({ event, match, distanceKm, isMine, onOpen }) => {
  const { lang, t } = useI18n();
  const isFull = !!event.capacity && event.stats.attendees >= event.capacity;

  return (
    <button
      onClick={() => onOpen(event.id)}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-blue-100 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 min-w-0">
          <Avatar name={event.hostName} photoURL={event.hostPhotoURL} />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <div className="text-sm text-gray-600 truncate">{t('card.by', { name: event.hostName })}</div>
          </div>
        </div>
        {isMine ? (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0">{t('card.going')}</span>
        ) : (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${paceMatchColor[match]}`}>
            {match === 'unknown' ? t('card.paceNotSet') : t(`match.${match}`)}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>{formatSessionTime(event.scheduledAt, lang)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin size={14} />
          <span className="truncate">
            {event.meetPointLabel || t('card.meetPointDefault')}
            {distanceKm !== undefined && <span className="text-gray-400"> · {formatKmAway(distanceKm, lang)}</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-sm">
        <div className="flex items-center space-x-4 text-gray-700">
          <span className="flex items-center space-x-1">
            <Route size={14} className="text-gray-400" />
            <span>{formatDistance(event.distancePlanKm)}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Timer size={14} className="text-gray-400" />
            <span>{formatPace(event.pacePlanSecPerKm)}</span>
          </span>
        </div>
        <span className={`flex items-center space-x-1 ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
          <Users size={14} />
          <span>
            {event.stats.attendees}
            {event.capacity ? `/${event.capacity}` : ''}
            {isFull ? ` ${t('card.full')}` : ''}
          </span>
        </span>
      </div>
    </button>
  );
};

export default EventCard;
