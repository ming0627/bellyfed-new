import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RestaurantMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
  zoom?: number;
  interactive?: boolean;
}

export function RestaurantMap({
  latitude,
  longitude,
  name,
  address,
  zoom = 15,
  interactive = true,
}: RestaurantMapProps): React.ReactElement {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsAPI = (): void => {
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else if (window.google?.maps) {
        initMap();
      }
    };

    // Initialize the map
    const initMap = (): void => {
      if (!mapRef.current || !window.google?.maps) return;

      const position = { lat: latitude, lng: longitude };

      // Create map instance
      const mapOptions: google.maps.MapOptions = {
        center: position,
        zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: interactive,
        zoomControl: interactive,
        scrollwheel: interactive,
        draggable: interactive,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Create marker
      markerRef.current = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: name,
        animation: google.maps.Animation.DROP,
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${name}</h3>
            <p style="font-size: 14px; color: #666;">${address}</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" 
               target="_blank" style="color: #1a73e8; font-size: 14px; display: block; margin-top: 8px;">
              Get directions
            </a>
          </div>
        `,
      });

      // Add click listener to marker
      markerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });

      // Open info window by default if not interactive
      if (!interactive) {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      }
    };

    loadGoogleMapsAPI();

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [latitude, longitude, name, address, zoom, interactive]);

  // If Google Maps API is not available, show a fallback
  const handleMapError = (): void => {
    if (!mapRef.current) return;

    mapRef.current.innerHTML = '';

    const fallbackDiv = document.createElement('div');
    fallbackDiv.className =
      'flex flex-col items-center justify-center w-full h-full bg-gray-100 rounded-lg';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'text-gray-400 mb-2';
    iconDiv.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

    const textDiv = document.createElement('div');
    textDiv.className = 'text-gray-500 text-sm';
    textDiv.textContent = 'Map not available';

    fallbackDiv.appendChild(iconDiv);
    fallbackDiv.appendChild(textDiv);
    mapRef.current.appendChild(fallbackDiv);
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      onError={handleMapError}
    >
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg">
        <div className="text-gray-400 flex flex-col items-center">
          <MapPin className="h-6 w-6 mb-2" />
          <span className="text-sm">Loading map...</span>
        </div>
      </div>
    </div>
  );
}
