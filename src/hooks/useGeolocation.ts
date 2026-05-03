import { useState, useEffect, useRef } from 'react';

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
  const lastUpdate = useRef(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ position: null, error: 'Selaimesi ei tue paikannusta' });
      return;
    }

    const onPosition = (pos: GeolocationPosition) => {
      lastUpdate.current = Date.now();
      setState({
        position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        error: null,
      });
    };

    const onError = (err: GeolocationPositionError) => {
      setState((prev) => ({ ...prev, error: err.message }));
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 3000,
      timeout: 15000,
    };

    const watchId = navigator.geolocation.watchPosition(onPosition, onError, options);

    // Fallback: poll getCurrentPosition if watchPosition goes silent for 10s
    const fallback = setInterval(() => {
      if (Date.now() - lastUpdate.current > 10000) {
        navigator.geolocation.getCurrentPosition(onPosition, onError, options);
      }
    }, 5000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(fallback);
    };
  }, []);

  return state;
}
