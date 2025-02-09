import React from 'react';
import { useQuery } from 'react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { Dog } from '../types';
import * as api from '../services/api';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import Link from 'next/link';

const HeartBreakAnimation = () => {
  return (
    <div className="relative w-24 h-24">
      <motion.div
        initial={{ x: 0, rotate: 0, opacity: 1 }}
        animate={{ 
          x: -40,
          rotate: -15,
          opacity: 0,
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full fill-red-500">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09L12 5.09V21.35z" />
        </svg>
      </motion.div>
      <motion.div
        initial={{ x: 0, rotate: 0, opacity: 1 }}
        animate={{ 
          x: 40,
          rotate: 15,
          opacity: 0,
        }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 24 24" className="w-full h-full fill-red-500">
          <path d="M12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3c-1.74 0-3.41.81-4.5 2.09L12 5.09V21.35z" />
        </svg>
      </motion.div>
    </div>
  );
};

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavoriteStore();
  const [removingDogs, setRemovingDogs] = React.useState<string[]>([]);
  
  const { data: favoriteDogs, isLoading } = useQuery(
    ['favoriteDogs', favorites],
    () => api.getDogsByIds(favorites),
    {
      enabled: favorites.length > 0,
    }
  );

  const handleRemove = (dogId: string) => {
    setRemovingDogs(prev => [...prev, dogId]);
    
    setTimeout(() => {
      removeFavorite(dogId);
      setRemovingDogs(prev => prev.filter(id => id !== dogId));
    }, 800);
  };

  return (
    <Layout title="Favorited Dogs">
      <div className="space-y-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No favorite dogs yet.</p>
            <Link 
              href="/search"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Find Dogs
            </Link>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {favoriteDogs?.map((dog: Dog) => (
                <motion.div
                  key={dog.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ 
                    opacity: 0,
                    scale: 0.8,
                    y: -100,
                    rotate: 10,
                    transition: { duration: 0.5 }
                  }}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => !removingDogs.includes(dog.id) && handleRemove(dog.id)}
                >
                  <div className="relative h-48">
                    <motion.div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-white text-lg font-semibold">
                        Goodbye Puppy
                      </span>
                    </motion.div>
                    <img
                      src={dog.img}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                    <AnimatePresence>
                      {removingDogs.includes(dog.id) && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ 
                            scale: 1,
                            opacity: 1,
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{ 
                            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                          }}
                        >
                          <HeartBreakAnimation />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{dog.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">Breed: {dog.breed}</p>
                      <p className="text-sm text-gray-600">Age: {dog.age} years</p>
                      <p className="text-sm text-gray-600">Location: {dog.zip_code}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage; 