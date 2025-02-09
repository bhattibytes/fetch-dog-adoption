import React from 'react';
import { Layout } from '../components/Layout';
import { useQuery } from 'react-query';
import * as api from '../services/api';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/solid';

const MatchPage = () => {
  const { favorites } = useFavoriteStore();

  const { data: match, isLoading, error, refetch } = useQuery(
    ['match', favorites],
    async () => {
      if (favorites.length === 0) {
        throw new Error('Please favorite some dogs first');
      }
      const { match: matchId } = await api.generateMatch(favorites);
      const dogDetails = await api.getDogsByIds([matchId]);
      return dogDetails[0];
    },
    {
      enabled: favorites.length > 0,
      retry: false,
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );

  if (favorites.length === 0) {
    return (
      <Layout title="Find Your Match">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <HeartIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
          <p className="text-gray-600 mb-6">
            Please favorite some dogs first to find your perfect match!
          </p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="Finding Your Match">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Looking for your perfect match...</p>
        </div>
      </Layout>
    );
  }

  if (error || !match) {
    return (
      <Layout title="Match Error">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-red-500 mb-4">Failed to find a match</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Perfect Match">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-[500px] w-full">
          <Image
            src={match.img}
            alt={match.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority
          />
          <div className="absolute inset-0 bg-gray-100 -z-10" />
        </div>
        <div className="p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{match.name}</h2>
              <HeartIcon className="h-8 w-8 text-red-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Breed</dt>
                    <dd className="text-gray-900 font-medium">{match.breed}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Age</dt>
                    <dd className="text-gray-900 font-medium">{match.age} years</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Location</dt>
                    <dd className="text-gray-900 font-medium">ZIP: {match.zip_code}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Match Info</h3>
                <p className="text-gray-600">
                  Based on your favorites, we think {match.name} would be a perfect companion for you! 
                  This lovely {match.breed} is {match.age} years old and ready to meet you.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Find Another Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MatchPage; 