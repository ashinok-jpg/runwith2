import { useCallback, useEffect, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

// Shibuya, used until the browser shares the runner's location
export const DEFAULT_LOCATION: LatLng = { lat: 35.658, lng: 139.7016 };

export type LocationStatus = 'locating' | 'granted' | 'denied' | 'unavailable';

export const useUserLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<LocationStatus>('locating');

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      err => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  return { location, status, locate };
};
