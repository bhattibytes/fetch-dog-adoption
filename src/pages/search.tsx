import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { DogCard } from '../components/DogCard';
import { Dog } from '../types';
import * as api from '../services/api';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/solid';
import { RangeSlider } from '../components/RangeSlider';
import { LocationSearch } from '../components/LocationSearch';

interface SearchFilters {
  breeds: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  sort?: string;
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    breeds: [],
    sort: 'breed:asc',
    ageMin: 0,
    ageMax: 15,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { favorites } = useFavoriteStore();

  const { data: breeds } = useQuery('breeds', api.getBreeds);

  const { data: searchResults, isLoading } = useQuery(
    ['dogs', filters, currentPage],
    async () => {
      const searchResponse = await api.searchDogs({
        ...filters,
        size: 20,
        from: ((currentPage - 1) * 20).toString(),
      });

      const dogs = await api.getDogsByIds(searchResponse.resultIds);
      return {
        dogs,
        total: searchResponse.total,
        next: searchResponse.next,
        prev: searchResponse.prev,
      };
    }
  );

  const [visibleDogs, setVisibleDogs] = useState<Dog[]>([]);

  useEffect(() => {
    if (searchResults?.dogs) {
      setVisibleDogs(searchResults.dogs);
    }
  }, [searchResults?.dogs]);

  const handleDogFavorite = (dogId: string) => {
    setVisibleDogs(current => current.filter(dog => dog.id !== dogId));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            {/* Sort By */}
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700">
                Sort By
              </label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300"
                value={filters.sort}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sort: e.target.value }))
                }
              >
                <option value="breed:asc">Breed (A-Z)</option>
                <option value="breed:desc">Breed (Z-A)</option>
                <option value="age:asc">Age (Youngest)</option>
                <option value="age:desc">Age (Oldest)</option>
              </select>
            </div>

            {/* Breed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Breed
              </label>
              <select
                multiple
                className="mt-1 block w-full rounded-md border-gray-300"
                onChange={(e) => {
                  const selectedBreeds = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  setFilters((prev) => ({ ...prev, breeds: selectedBreeds }));
                }}
              >
                {breeds?.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Search */}
            <LocationSearch
              onLocationSelect={(zipCodes) =>
                setFilters((prev) => ({ ...prev, zipCodes }))
              }
            />

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Range
              </label>
              <RangeSlider
                min={0}
                max={15}
                minValue={filters.ageMin ?? 0}
                maxValue={filters.ageMax ?? 15}
                onChange={({ min, max }) =>
                  setFilters((prev) => ({
                    ...prev,
                    ageMin: min,
                    ageMax: max,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {visibleDogs.map((dog: Dog) => (
                <motion.div
                  key={dog.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <DogCard 
                    dog={dog} 
                    onFavorite={() => handleDogFavorite(dog.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        <div className="flex justify-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {currentPage}</span>
          <button
            disabled={!searchResults?.next}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
} 