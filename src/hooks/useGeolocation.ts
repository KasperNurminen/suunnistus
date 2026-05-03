import { useState, useEffect } from 'react';

interface Position {
  lat: number;
  lng: number;
}

interface GeolocationState {
  position: Position | null;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ position: null, error: 'Selaimesi ei tue paikannusta' });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        setState((prev) => ({ ...prev, error: err.message }));
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
