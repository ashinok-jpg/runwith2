import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Trophy, Bookmark } from 'lucide-react';
import { Event } from '../../types';
import { formatPace, formatDistance } from '../../utils/formatters';

interface EventCardProps {
  event: Event;
  onJoin: (eventId: string) => void;
  onBookmark: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onJoin, onBookmark }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    onBookmark(event.id);
  };

  const handleJoin = () => {
    setHasJoined(true);
    onJoin(event.id);
  };

  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Today at ${timeString}`;
    } else if (isTomorrow) {
      return `Tomorrow at ${timeString}`;
    } else {
      return `${date.toLocaleDateString()} at ${timeString}`;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden hover:shadow-md transition-all">
      {/* Header with event indicator */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2">
        <div className="flex items-center space-x-2 text-white">
          <Trophy size={16} />
          <span className="text-sm font-medium">Upcoming Event</span>
        </div>
      </div>

      <div className="p-4">
        {/* Title and Host */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {event.host?.displayName?.[0] || 'H'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <div className="text-sm text-gray-600">
                by {event.host?.displayName || 'Anonymous Host'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{formatEventTime(event.scheduledAt)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin size={14} />
            <span>Meet point selected</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatDistance(event.distancePlanKm)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Trophy size={14} />
              <span>{formatPace(event.pacePlanSecPerKm)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {event.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
              {event.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users size={14} />
            <span>{event.stats.attendees} going</span>
            {event.capacity && <span>• {event.capacity} max</span>}
          </div>

          <button
            onClick={handleJoin}
            disabled={hasJoined}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              hasJoined
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
            }`}
          >
            {hasJoined ? 'Joined!' : 'Join Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;