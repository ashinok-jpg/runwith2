import React, { useMemo } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { distanceBetween } from 'geofire-common';
import BottomSheet from '../common/BottomSheet';
import { RUNNING_SPOTS, type RunningSpot } from '../../data/runningSpots';
import type { LatLng } from '../../lib/geo';
import { useI18n } from '../../i18n/context';
import { formatKmAway } from '../../utils/formatters';

interface SpotsSheetProps {
  // Spots are listed nearest to this point first
  origin: LatLng;
  onSelect: (spot: RunningSpot) => void;
  onClose: () => void;
}

const SpotsSheet: React.FC<SpotsSheetProps> = ({ origin, onSelect, onClose }) => {
  const { lang, t } = useI18n();

  const spots = useMemo(
    () =>
      RUNNING_SPOTS.map(spot => ({
        spot,
        distanceKm: distanceBetween([spot.lat, spot.lng], [origin.lat, origin.lng]),
      })).sort((a, b) => a.distanceKm - b.distanceKm),
    [origin.lat, origin.lng]
  );

  return (
    <BottomSheet title={t('spots.title')} onClose={onClose}>
      <p className="text-sm text-gray-500 mb-3">{t('spots.hint')}</p>
      <ul className="space-y-2">
        {spots.map(({ spot, distanceKm }) => (
          <li key={spot.id}>
            <button
              onClick={() => onSelect(spot)}
              className="w-full flex items-center space-x-3 text-left bg-gray-50 hover:bg-blue-50 rounded-xl p-3 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{spot.name[lang]}</div>
                <div className="text-xs text-gray-500 truncate">
                  {spot.area[lang]} · {formatKmAway(distanceKm, lang)}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{spot.note[lang]}</div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
};

export default SpotsSheet;
