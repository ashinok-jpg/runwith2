import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, Crosshair, Plus, Star, X } from 'lucide-react';
import CreateSessionSheet from '../sessions/CreateSessionSheet';
import SpotsSheet from '../sessions/SpotsSheet';
import { RUNNING_SPOTS, type RunningSpot } from '../../data/runningSpots';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../lib/authContext';
import { DEFAULT_LOCATION, type LatLng, type LocationStatus } from '../../lib/geo';
import { useNearbySessions, type NearbySession } from '../../lib/sessions';
import { formatPace } from '../../utils/formatters';
import { getPaceMatch, type PaceMatch } from '../../utils/matching';

interface MapProps {
  userLocation: LatLng | null;
  locationStatus: LocationStatus;
  onLocate: () => void;
  onOpenSession: (eventId: string) => void;
  createRequested: boolean;
  onCreateHandled: () => void;
}

const markerColors: Record<PaceMatch, string> = {
  great: 'bg-green-500 border-green-600',
  good: 'bg-blue-500 border-blue-600',
  unknown: 'bg-indigo-500 border-indigo-600',
  slower: 'bg-gray-500 border-gray-600',
  faster: 'bg-orange-500 border-orange-600',
};

const sessionIcon = (session: NearbySession, match: PaceMatch) =>
  L.divIcon({
    className: '',
    iconSize: [64, 30],
    iconAnchor: [32, 30],
    html: `<div class="flex flex-col items-center">
      <div class="${markerColors[match]} border-2 text-white text-xs font-semibold rounded-full px-2 py-0.5 shadow-md whitespace-nowrap">
        ${formatPace(session.pacePlanSecPerKm).replace('/km', '')} · ${session.stats.attendees}${session.capacity ? `/${session.capacity}` : ''}
      </div>
      <div class="w-0 h-0 border-x-[6px] border-x-transparent border-t-[7px] border-t-gray-700"></div>
    </div>`,
  });

const draftIcon = L.divIcon({
  className: '',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  html: `<div class="flex flex-col items-center animate-bounce">
    <div class="w-8 h-8 rounded-full bg-blue-600 border-[3px] border-white shadow-lg flex items-center justify-center text-white text-lg font-bold">+</div>
    <div class="w-1 h-2 bg-blue-600"></div>
  </div>`,
});

const spotIcon = L.divIcon({
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<div class="w-[26px] h-[26px] rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">★</div>`,
});

// Distance from the map center to its corner, so the query covers what's on screen
const visibleRadiusKm = (map: L.Map) => {
  const bounds = map.getBounds();
  const km = map.getCenter().distanceTo(bounds.getNorthEast()) / 1000;
  return Math.min(Math.max(Math.ceil(km), 1), 50);
};

const ViewportWatcher: React.FC<{
  onChange: (center: LatLng, radiusKm: number) => void;
  onMapClick: (point: LatLng) => void;
}> = ({ onChange, onMapClick }) => {
  const map = useMapEvents({
    moveend: () => onChange(map.getCenter(), visibleRadiusKm(map)),
    click: e => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });

  useEffect(() => {
    onChange(map.getCenter(), visibleRadiusKm(map));
    // Report the starting viewport once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const FlyTo: React.FC<{ target: LatLng | null }> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [map, target]);
  return null;
};

const Map: React.FC<MapProps> = ({
  userLocation,
  locationStatus,
  onLocate,
  onOpenSession,
  createRequested,
  onCreateHandled,
}) => {
  const { profile } = useAuth();
  const { lang, t } = useI18n();
  const [viewport, setViewport] = useState<{ center: LatLng; radiusKm: number } | null>(null);
  const [flyTarget, setFlyTarget] = useState<LatLng | null>(null);
  const [placing, setPlacing] = useState(false);
  const [draftPoint, setDraftPoint] = useState<LatLng | null>(null);
  // Name of the popular spot the pin was placed at, cleared when the pin is moved elsewhere
  const [draftLabel, setDraftLabel] = useState('');
  const [showSpots, setShowSpots] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [matchesOnly, setMatchesOnly] = useState(false);

  const { sessions, error } = useNearbySessions(viewport?.center ?? null, viewport?.radiusKm ?? 5);

  // Center on the runner once their location arrives
  useEffect(() => {
    if (userLocation) setFlyTarget(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (createRequested) {
      setPlacing(true);
      onCreateHandled();
    }
  }, [createRequested, onCreateHandled]);

  const visibleSessions = useMemo(
    () =>
      sessions
        .map(session => ({ session, match: getPaceMatch(session.pacePlanSecPerKm, profile) }))
        .filter(({ match }) => !matchesOnly || match === 'great' || match === 'good'),
    [sessions, profile, matchesOnly]
  );

  const stopPlacing = () => {
    setPlacing(false);
    setDraftPoint(null);
    setDraftLabel('');
    setShowForm(false);
  };

  const handleMapClick = (point: LatLng) => {
    if (!placing) return;
    setDraftPoint(point);
    setDraftLabel('');
  };

  const selectSpot = (spot: RunningSpot) => {
    const point = { lat: spot.lat, lng: spot.lng };
    setShowSpots(false);
    setPlacing(true);
    setDraftPoint(point);
    setDraftLabel(spot.name[lang]);
    setFlyTarget(point);
  };

  const handleLocate = () => {
    if (userLocation) setFlyTarget({ ...userLocation });
    onLocate();
  };

  const start = userLocation ?? DEFAULT_LOCATION;

  return (
    <div className="absolute inset-0 isolate">
      <MapContainer center={[start.lat, start.lng]} zoom={14} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ViewportWatcher onChange={(center, radiusKm) => setViewport({ center, radiusKm })} onMapClick={handleMapClick} />
        <FlyTo target={flyTarget} />

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
          />
        )}

        {RUNNING_SPOTS.map(spot => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={spotIcon}
            title={spot.name[lang]}
            zIndexOffset={-100}
            eventHandlers={{ click: () => selectSpot(spot) }}
          />
        ))}

        {!placing &&
          visibleSessions.map(({ session, match }) => (
            <Marker
              key={session.id}
              position={[session.meetPoint.lat, session.meetPoint.lng]}
              icon={sessionIcon(session, match)}
              eventHandlers={{ click: () => onOpenSession(session.id) }}
              title={session.title}
            />
          ))}

        {placing && draftPoint && (
          <Marker
            position={[draftPoint.lat, draftPoint.lng]}
            icon={draftIcon}
            draggable
            eventHandlers={{
              dragend: e => {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                setDraftPoint({ lat, lng });
              },
            }}
          />
        )}
      </MapContainer>

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-start justify-between space-x-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-start space-y-2 min-w-0">
          {placing ? (
            <div className="bg-blue-600 text-white rounded-xl shadow-lg px-4 py-3 text-sm font-medium max-w-xs">
              {draftPoint ? t('map.adjustPin') : t('map.tapToPlace')}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-white rounded-full shadow-md px-3 py-1.5 text-sm text-gray-700">
                {visibleSessions.length === 1 ? t('map.countOne') : t('map.count', { n: visibleSessions.length })}
              </div>
              <button
                onClick={() => setMatchesOnly(!matchesOnly)}
                aria-pressed={matchesOnly}
                className={`rounded-full shadow-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  matchesOnly ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t('map.myPace')}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowSpots(true)}
            className="flex items-center space-x-1.5 bg-white rounded-full shadow-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span>{t('map.spots')}</span>
          </button>
        </div>

        <button
          onClick={handleLocate}
          aria-label={t('map.showMyLocation')}
          title={t('map.showMyLocation')}
          className="pointer-events-auto w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <Crosshair size={18} className={locationStatus === 'granted' ? 'text-blue-600' : 'text-gray-500'} />
        </button>
      </div>

      {(error || locationStatus === 'denied') && !placing && (
        <div className="absolute top-28 left-3 right-3 z-[1000] bg-white/95 rounded-lg shadow px-3 py-2 text-xs text-gray-600">
          {error ? t('feed.loadError') : t('map.locationOff')}
        </div>
      )}

      {/* Bottom actions */}
      <div className="absolute bottom-6 left-3 right-3 z-[1000] flex justify-center pb-safe">
        {placing ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={stopPlacing}
              className="flex items-center space-x-1.5 bg-white text-gray-700 rounded-full shadow-lg px-5 py-3 font-medium hover:bg-gray-50"
            >
              <X size={18} />
              <span>{t('map.cancel')}</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              disabled={!draftPoint}
              className="flex items-center space-x-1.5 bg-blue-600 text-white rounded-full shadow-lg px-5 py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Check size={18} />
              <span>{t('map.meetHere')}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setPlacing(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg px-6 py-3 font-semibold hover:shadow-xl active:scale-95 transition-all"
          >
            <Plus size={20} />
            <span>{t('map.newSession')}</span>
          </button>
        )}
      </div>

      {showForm && draftPoint && (
        <CreateSessionSheet
          meetPoint={draftPoint}
          initialLabel={draftLabel}
          onClose={() => setShowForm(false)}
          onCreated={id => {
            stopPlacing();
            onOpenSession(id);
          }}
        />
      )}
      {showSpots && (
        <SpotsSheet origin={viewport?.center ?? start} onSelect={selectSpot} onClose={() => setShowSpots(false)} />
      )}
    </div>
  );
};

export default Map;
