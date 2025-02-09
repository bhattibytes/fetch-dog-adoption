import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPinIcon } from '@heroicons/react/24/outline';
import * as api from '../services/api';
import { useQuery } from 'react-query';
import { Location } from '../types';
import Link from 'next/link';

interface LocationSearchProps {
  onLocationSelect: (zipCodes: string[]) => void;
}

interface HereSearchResult {
  items: Array<{
    position: {
      lat: number;
      lng: number;
    };
    address: {
      city: string;
      state: string;
      postalCode: string;
    };
  }>;
}

export const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(50); // miles
  const [showResults, setShowResults] = useState(false);

  const { data: locations, isLoading } = useQuery(
    ['locations', searchTerm, radius],
    async () => {
      if (!searchTerm) return null;
      
      // First get the coordinates for the searched location
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(searchTerm)}&apiKey=${process.env.NEXT_PUBLIC_HERE_API_KEY}`
      );
      const data: HereSearchResult = await response.json();
      
      if (!data.items?.[0]) return null;
      
      const { position } = data.items[0];
      
      // Then search for locations within the radius
      const searchResponse = await api.searchLocations({
        geoBoundingBox: {
          top: { lat: position.lat + (radius / 69), lon: position.lng },
          bottom: { lat: position.lat - (radius / 69), lon: position.lng },
          left: { lat: position.lat, lon: position.lng - (radius / 69 / Math.cos(position.lat * Math.PI / 180)) },
          right: { lat: position.lat, lon: position.lng + (radius / 69 / Math.cos(position.lat * Math.PI / 180)) }
        },
        size: 100
      });

      return searchResponse.results as Location[];
    },
    {
      enabled: Boolean(searchTerm),
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleLocationSelect = () => {
    if (locations) {
      onLocationSelect(locations.map(loc => loc.zip_code));
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Search by Location
        </label>
        <Link
          href="/map"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Use Map View
        </Link>
      </div>
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              placeholder="Enter city, state, or ZIP"
              className="block w-full rounded-md border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isLoading}
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
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
          <div className="text-sm text-gray-600 text-center">{radius} miles</div>
        </div>
      </form>

      <AnimatePresence>
        {showResults && locations && locations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  {locations.length} locations found
                </span>
                <button
                  onClick={handleLocationSelect}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Search all locations
                </button>
              </div>
              <div className="max-h-60 overflow-auto">
                {locations.map((location) => (
                  <div
                    key={location.zip_code}
                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      onLocationSelect([location.zip_code]);
                      setShowResults(false);
                    }}
                  >
                    <div className="text-sm">
                      {location.city}, {location.state} {location.zip_code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 