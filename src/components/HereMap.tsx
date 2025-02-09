import React, { useEffect, useRef, useState } from 'react';
import { Location, Dog } from '../types';
import { useQuery } from 'react-query';
import * as api from '../services/api';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { toast } from 'react-hot-toast';

interface HereMapProps {
  center: { lat: number; lng: number };
  radius: number;
  locations?: Location[];
  onMapClick: (lat: number, lng: number) => void;
}

interface LocationWithDogs extends Location {
  dogs?: Dog[];
}

interface DogMap {
  [zipCode: string]: Dog[];
}

declare global {
  interface Window {
    H: any; // HERE Maps namespace
    H_UI: any;
    H_MAPEVENTS: any;
    H_MAP: any;
    handleFavorite: (dogId: string) => void;
  }
}

export const HereMap: React.FC<HereMapProps> = ({ center, radius, locations, onMapClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const uiRef = useRef<any>(null);
  const currentLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const { favorites, addFavorite, removeFavorite } = useFavoriteStore();
  const [localFavorites, setLocalFavorites] = useState<string[]>(favorites);

  // Update local favorites when store favorites change
  useEffect(() => {
    setLocalFavorites(favorites);
  }, [favorites]);

  const { data: dogsData } = useQuery<DogMap>(
    ['locationDogs', locations],
    async () => {
      if (!locations?.length) return {};

      const dogsMap: DogMap = {};
      
      // Get all dogs for these locations
      const searchResponse = await api.searchDogs({
        zipCodes: locations.map(loc => loc.zip_code),
        size: 100
      });

      if (searchResponse.resultIds.length) {
        const dogs = await api.getDogsByIds(searchResponse.resultIds);
        
        // Group dogs by zip code
        dogs.forEach((dog: Dog) => {
          if (!dogsMap[dog.zip_code]) {
            dogsMap[dog.zip_code] = [];
          }
          dogsMap[dog.zip_code].push(dog);
        });
      }

      return dogsMap;
    },
    {
      enabled: Boolean(locations?.length)
    }
  );

  useEffect(() => {
    if (!mapRef.current || !window.H) return;

    const initMap = () => {
      try {
        // Initialize the Platform object
        const platform = new window.H.service.Platform({
          apikey: process.env.NEXT_PUBLIC_HERE_API_KEY!
        });

        // Get default layers
        const defaultLayers = platform.createDefaultLayers();

        // Initialize map with basic map layer
        const map = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            center,
            zoom: 8,
            pixelRatio: window.devicePixelRatio || 1,
            padding: { top: 50, right: 50, bottom: 50, left: 50 }
          }
        );

        // Enable map interaction (pan, zoom, pinch-to-zoom)
        const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(map));
        behavior.enable();

        // Add UI components with error handling
        try {
          uiRef.current = window.H.ui.UI.createDefault(map, defaultLayers);
        } catch (error) {
          console.error('Error creating UI:', error);
        }

        // Add click listener with error handling
        map.addEventListener('tap', (evt: any) => {
          try {
            const coord = map.screenToGeo(
              evt.currentPointer.viewportX,
              evt.currentPointer.viewportY
            );
            onMapClick(coord.lat, coord.lng);
          } catch (error) {
            console.error('Error handling map click:', error);
          }
        });

        mapInstanceRef.current = map;

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    let initAttempts = 0;
    const maxAttempts = 3;

    const tryInitMap = () => {
      if (initAttempts >= maxAttempts) {
        console.error('Failed to initialize map after multiple attempts');
        return;
      }

      try {
        initMap();
      } catch (error) {
        console.error(`Map initialization attempt ${initAttempts + 1} failed:`, error);
        initAttempts++;
        setTimeout(tryInitMap, 1000); // Retry after 1 second
      }
    };

    tryInitMap();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.dispose();
        } catch (error) {
          console.error('Error disposing map:', error);
        }
      }
    };
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    try {
      mapInstanceRef.current.setCenter(center);
    } catch (error) {
      console.error('Error updating map center:', error);
    }
  }, [center]);

  // Update markers when locations or favorites change
  useEffect(() => {
    if (!mapInstanceRef.current || !locations || !dogsData) return;

    try {
      // Store current view state
      const currentView = mapInstanceRef.current.getViewModel().getLookAtData();

      // Clear existing objects
      mapInstanceRef.current.removeObjects(mapInstanceRef.current.getObjects());

      // Add radius circle
      const circle = new window.H.map.Circle(
        center,
        radius * 1609.34,
        {
          style: {
            strokeColor: '#3b82f6',
            lineWidth: 2,
            fillColor: 'rgba(59, 130, 246, 0.2)'
          }
        }
      );
      mapInstanceRef.current.addObject(circle);

      // Create a group for all markers
      const markerGroup = new window.H.map.Group();

      // Filter locations to only those with dogs and not in favorites
      const locationsWithDogs = locations.filter(location => {
        const locationDogs = dogsData[location.zip_code] || [];
        return locationDogs.some(dog => !favorites.includes(dog.id));
      });

      // Add location markers
      locationsWithDogs.forEach(location => {
        if (location.latitude && location.longitude) {
          const marker = new window.H.map.Marker({
            lat: location.latitude,
            lng: location.longitude
          });
          
          marker.addEventListener('tap', () => {
            if (uiRef.current) {
              uiRef.current.getBubbles().forEach((b: any) => b.close());
              
              currentLocationRef.current = {
                lat: location.latitude,
                lng: location.longitude
              };

              const locationDogs = dogsData[location.zip_code] || [];
              const availableDogs = locationDogs.filter(
                dog => !favorites.includes(dog.id)
              );

              const dogsHtml = availableDogs.map(dog => `
                <div class="flex items-center gap-4 p-3 border-b border-gray-200 hover:bg-gray-50">
                  <img 
                    src="${dog.img}" 
                    alt="${dog.name}" 
                    class="w-20 h-20 object-cover rounded-lg shadow-sm"
                  />
                  <div class="flex-grow">
                    <div class="font-semibold text-lg">${dog.name}</div>
                    <div class="text-gray-600">${dog.breed}</div>
                  </div>
                  ${createFavoriteButton(dog.id)}
                </div>
              `).join('');

              const bubble = new window.H.ui.InfoBubble(
                { lat: location.latitude, lng: location.longitude },
                {
                  content: `
                    <div class="p-4" style="min-width: 400px; max-width: 90vw;">
                      <div class="font-semibold text-xl mb-4">
                        ${location.city}, ${location.state} ${location.zip_code}
                      </div>
                      <div style="display: grid; gap: 0.5rem;">
                        ${dogsHtml}
                      </div>
                    </div>
                  `,
                  width: 'auto',
                  maxWidth: '90vw'
                }
              );
              
              uiRef.current.addBubble(bubble);
              window.handleFavorite = handleFavorite;
            }
          });

          markerGroup.addObject(marker);
        }
      });

      mapInstanceRef.current.addObject(markerGroup);

      // Only adjust viewport on initial load or center/radius change
      if (markerGroup.getObjects().length > 0 && !currentView) {
        mapInstanceRef.current.getViewModel().setLookAtData({
          bounds: markerGroup.getBoundingBox()
        });
      } else if (currentView) {
        // Restore previous view state
        mapInstanceRef.current.getViewModel().setLookAtData(currentView);
      }
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [locations, center, radius, dogsData, favorites]);

  const handleFavorite = (dogId: string) => {
    if (localFavorites.includes(dogId)) {
      setLocalFavorites(prev => prev.filter(id => id !== dogId));
      removeFavorite(dogId);
      toast.success('Dog removed from favorites');
    } else {
      setLocalFavorites(prev => [dogId, ...prev]);
      addFavorite(dogId);
      toast.success('Dog added to favorites!');
    }
    
    // Close all bubbles immediately
    if (uiRef.current) {
      uiRef.current.getBubbles().forEach((bubble: any) => {
        uiRef.current.removeBubble(bubble);
      });
    }
    
    currentLocationRef.current = null;
  };

  const createFavoriteButton = (dogId: string) => {
    // Use local favorites state instead of store favorites
    const isFavorite = localFavorites.includes(dogId);
    return `
      <button 
        onclick="window.handleFavorite('${dogId}')"
        class="favorite-btn p-2 rounded-full hover:bg-gray-100 text-red-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" 
          fill="${isFavorite ? 'currentColor' : 'none'}" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>
    `;
  };

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
}; 