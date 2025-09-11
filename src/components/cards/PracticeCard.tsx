import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, MapPin, Clock, Trophy } from 'lucide-react';
import { Practice } from '../../types';
import { formatPace, formatDuration, formatDistance, formatTime, getIntensityColor, getIntensityLabel } from '../../utils/formatters';

interface PracticeCardProps {
  practice: Practice;
  onKudos: (practiceId: string) => void;
  onJoinRequest: (practiceId: string) => void;
  onComment: (practiceId: string) => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ practice, onKudos, onJoinRequest, onComment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const handleKudos = () => {
    setIsLiked(!isLiked);
    onKudos(practice.id);
  };

  const handleJoinRequest = () => {
    setHasRequested(true);
    onJoinRequest(practice.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {practice.owner?.displayName?.[0] || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {practice.owner?.displayName || 'Anonymous Runner'}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock size={12} />
                <span>{formatTime(practice.createdAt)}</span>
                <span>•</span>
                <MapPin size={12} />
                <span>Nearby</span>
              </div>
            </div>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIntensityColor(practice.intensity)}`}>
            {getIntensityLabel(practice.intensity)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatDistance(practice.distanceKm)}</div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatDuration(practice.durationSec)}</div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{formatPace(practice.avgPaceSecPerKm)}</div>
            <div className="text-xs text-gray-500">Pace</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {practice.tags.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {practice.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleKudos}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{practice.stats.kudos}</span>
            </button>
            
            <button
              onClick={() => onComment(practice.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="text-sm">{practice.stats.comments}</span>
            </button>
          </div>

          {practice.inviteOpen && (
            <button
              onClick={handleJoinRequest}
              disabled={hasRequested}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                hasRequested
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <UserPlus size={14} />
              <span>{hasRequested ? 'Request Sent' : 'Next time, together?'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeCard;