import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/router';
import { useCountry } from '@/contexts/CountryContext';

interface RestaurantMapViewProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  onSearch?: (bounds: google.maps.LatLngBounds) => void;
}

export function RestaurantMapView({
  restaurants,
  isLoading,
  onSearch,
}: RestaurantMapViewProps): React.ReactElement {
  const router = useRouter();
  const { currentCountry } = useCountry();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchingArea, setSearchingArea] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = (): void => {
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setMapLoaded(true);
          initMap();
        };
        document.head.appendChild(script);
      } else if (window.google?.maps) {
        setMapLoaded(true);
        initMap();
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize map
  const initMap = (): void => {
    if (!mapRef.current || !window.google?.maps) return;

    // Default center (can be adjusted based on user location)
    const defaultCenter = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur

    // Create map instance
    const mapOptions: google.maps.MapOptions = {
      center: defaultCenter,
      zoom: 12,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new google.maps.InfoWindow();

    // Add search this area button
    if (onSearch) {
      mapInstanceRef.current.addListener('idle', () => {
        const bounds = mapInstanceRef.current?.getBounds();
        if (bounds) {
          const searchButton = document.createElement('div');
          searchButton.className = 'custom-map-control';
          searchButton.innerHTML = `
            <button class="bg-white shadow-md rounded-md px-4 py-2 flex items-center text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search this area
            </button>
          `;
          searchButton.addEventListener('click', () => {
            if (bounds && onSearch) {
              setSearchingArea(true);
              onSearch(bounds);
              setTimeout(() => setSearchingArea(false), 2000);
            }
          });

          // Remove existing button if any
          const existingButton = document.querySelector('.custom-map-control');
          if (existingButton) {
            existingButton.remove();
          }

          mapInstanceRef.current?.controls[
            google.maps.ControlPosition.TOP_CENTER
          ].push(searchButton);
        }
      });
    }
  };

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (restaurants.length === 0) return;

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();

    // Add markers for each restaurant
    restaurants.forEach((restaurant) => {
      const position = {
        lat: restaurant.latitude,
        lng: restaurant.longitude,
      };

      // Add to bounds
      bounds.extend(position);

      // Create marker
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: restaurant.name,
        animation: google.maps.Animation.DROP,
      });

      // Create info window content
      const infoWindowContent = `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 16px;">${restaurant.name}</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${restaurant.address}</p>
          ${
            restaurant.rating
              ? `<div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="color: #f59e0b; margin-right: 4px;">★</span>
              <span style="font-weight: 500;">${restaurant.rating.toFixed(1)}</span>
            </div>`
              : ''
          }
          <button 
            id="view-restaurant-${restaurant.restaurantId}" 
            style="background-color: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; width: 100%;"
          >
            View Details
          </button>
        </div>
      `;

      // Add click listener to marker
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoWindowContent);
          infoWindowRef.current.open(mapInstanceRef.current, marker);

          // Add event listener to the view details button
          setTimeout(() => {
            const viewButton = document.getElementById(
              `view-restaurant-${restaurant.restaurantId}`,
            );
            if (viewButton) {
              viewButton.addEventListener('click', () => {
                router.push(
                  `/${currentCountry.code}/restaurant/${restaurant.restaurantId}`,
                );
              });
            }
          }, 0);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit map to bounds
    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);

      // Adjust zoom level if too zoomed in
      const listener = mapInstanceRef.current.addListener('idle', () => {
        if (mapInstanceRef.current) {
          const zoom = mapInstanceRef.current.getZoom();
          if (typeof zoom === 'number' && zoom > 16) {
            mapInstanceRef.current.setZoom(16);
          }
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [restaurants, mapLoaded, router, currentCountry.code]);

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
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" onError={handleMapError}>
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          <div className="text-gray-400 flex flex-col items-center">
            <MapPin className="h-6 w-6 mb-2" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {(isLoading || searchingArea) && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 flex items-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-red-600" />
            <span>
              {searchingArea
                ? 'Searching this area...'
                : 'Loading restaurants...'}
            </span>
          </div>
        </div>
      )}

      {/* No results message */}
      {!isLoading && restaurants.length === 0 && mapLoaded && (
        <div className="absolute top-4 left-0 right-0 mx-auto w-max">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <p className="text-gray-700">No restaurants found in this area</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                if (mapInstanceRef.current) {
                  // Reset to default view
                  mapInstanceRef.current.setCenter({
                    lat: 3.139,
                    lng: 101.6869,
                  });
                  mapInstanceRef.current.setZoom(12);
                }
              }}
            >
              Reset Map
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
