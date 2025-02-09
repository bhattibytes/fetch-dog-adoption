import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { HereMap } from '../components/HereMap';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import * as api from '../services/api';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import Image from 'next/image';
import { Dog } from '../types';

const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795, // Center of the US
};

const MapPage = () => {
  const router = useRouter();
  const [center, setCenter] = useState(defaultCenter);
  const [radius, setRadius] = useState(50); // miles
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ZIP code regex pattern
  const zipCodePattern = /^\d{5}$/;

  const { data: locations } = useQuery(
    ['locations', center, radius],
    async () => {
      const radiusInDegrees = radius / 69;
      const searchResponse = await api.searchLocations({
        geoBoundingBox: {
          bottom: { lat: center.lat - radiusInDegrees, lon: center.lng },
          top: { lat: center.lat + radiusInDegrees, lon: center.lng },
          left: { lat: center.lat, lon: center.lng - radiusInDegrees },
          right: { lat: center.lat, lon: center.lng + radiusInDegrees }
        },
        size: 20
      });

      const locationsWithDistance = searchResponse.results.map(location => ({
        ...location,
        distance: Math.sqrt(
          Math.pow(location.latitude - center.lat, 2) + 
          Math.pow(location.longitude - center.lng, 2)
        )
      }));

      return locationsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 20);
    },
    {
      enabled: Boolean(center),
      retry: 3,
      retryDelay: 1000,
      onError: (error) => {
        console.error('Location search failed:', error);
        toast.error('Failed to find locations in this area');
      }
    }
  );

  const { favorites, removeFavorite } = useFavoriteStore();
  const [localFavorites, setLocalFavorites] = useState<string[]>(favorites);

  // Update local favorites when store favorites change
  useEffect(() => {
    setLocalFavorites(favorites);
  }, [favorites]);

  // Query to fetch favorite dogs
  const { data: favoriteDogs } = useQuery(
    ['favoriteDogs', localFavorites],
    async () => {
      if (!localFavorites.length) return [];
      const dogs = await api.getDogsByIds(localFavorites);
      
      // Create a map for O(1) lookups
      const dogsMap = new Map(dogs.map(dog => [dog.id, dog]));
      
      // Return dogs in the same order as localFavorites
      return localFavorites
        .map(id => dogsMap.get(id))
        .filter((dog): dog is NonNullable<typeof dog> => dog !== undefined);
    },
    {
      enabled: Boolean(localFavorites.length)
    }
  );

  const handleRemoveFavorite = (dogId: string, dogName: string) => {
    setLocalFavorites(prev => prev.filter(id => id !== dogId));
    removeFavorite(dogId);
    toast.success(`${dogName} removed from favorites`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm) {
      toast.error('Please enter a ZIP code');
      return;
    }

    if (!zipCodePattern.test(searchTerm)) {
      toast.error('Please enter a valid 5-digit ZIP code');
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?qq=postalCode=${searchTerm};country=USA&apiKey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.items?.[0]?.position) {
        const { lat, lng } = data.items[0].position;
        setCenter({ lat, lng });
        toast.success('Location found!');
      } else {
        toast.error('ZIP code not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to find location');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchHere = () => {
    if (locations) {
      const zipCodes = locations.map(loc => loc.zip_code);
      router.push({
        pathname: '/search',
        query: { zipCodes: zipCodes.join(',') }
      });
    }
  };

  return (
    <Layout title="Search Dogs by ZIP Code">
      <div className="space-y-6">
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter ZIP code"
              className="flex-1 rounded-md border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.slice(0, 5))}
              pattern="\d{5}"
              maxLength={5}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSearching}
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          </form>

          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Radius (miles)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {radius} miles
                </div>
                <button
                  onClick={handleSearchHere}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={!locations?.length}
                >
                  Search Dogs Here
                </button>
              </div>
            </div>
          </div>

          <div className="h-[600px] relative">
            <HereMap
              center={center}
              radius={radius}
              locations={locations}
              onMapClick={() => {}}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <HeartIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Favorited Dogs</h2>
          </div>
          
          {!favoriteDogs?.length ? (
            <p className="text-gray-500 text-center py-4">
              No dogs favorited yet. Click the heart icon on a dog to add it to your favorites!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteDogs.map((dog: Dog) => (
                <div 
                  key={dog.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={dog.img}
                      alt={dog.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{dog.name}</h3>
                    <p className="text-gray-600">{dog.breed}</p>
                    <p className="text-gray-500 text-sm">ZIP: {dog.zip_code}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(dog.id, dog.name)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    title="Remove from favorites"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MapPage; 