import { useState, useCallback, useEffect } from 'react';

/**
 * Interface for geolocation coordinates
 */
export interface GeolocationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Interface for geolocation options
 */
export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

/**
 * Interface for geolocation state
 */
export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  error: GeolocationPositionError | null;
  loading: boolean;
}

/**
 * Hook for accessing the browser's geolocation API
 * 
 * @param options - Options for the geolocation API
 * @returns An object containing the current coordinates, error state, loading state, and a function to get the current position
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
    watchPosition = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: false,
  });

  // Function to get the current position
  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser.',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        coordinates: null,
        error,
        loading: false,
      });
    };

    if (watchPosition) {
      const watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        geoOptions
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
      return undefined;
    }
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition]);

  // Set up watch position if enabled
  useEffect(() => {
    if (watchPosition) {
      return getPosition();
    }
    return undefined;
  }, [watchPosition, getPosition]);

  return {
    ...state,
    getPosition,
  };
}
