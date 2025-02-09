import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dog } from '../types';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { HeartIcon } from '@heroicons/react/24/outline';

interface DogCardProps {
  dog: Dog;
  onFavorite?: () => void;
}

export const DogCard = ({ dog, onFavorite }: DogCardProps) => {
  const { addFavorite } = useFavoriteStore();
  const [isLiked, setIsLiked] = React.useState(false);
  const [showHeart, setShowHeart] = React.useState(false);

  const handleClick = async () => {
    if (!isLiked) {
      setIsLiked(true);
      setShowHeart(true);
      addFavorite(dog.id);
      
      setTimeout(() => {
        setShowHeart(false);
        if (onFavorite) {
          onFavorite();
        }
      }, 800);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      exit={isLiked ? {
        opacity: 0,
        scale: 0.8,
        y: -100,
        rotate: -10,
        transition: { duration: 0.5 }
      } : undefined}
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
    >
      <div 
        className="relative h-48"
        onClick={handleClick}
      >
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          whileHover={{ opacity: 1 }}
        >
          <span className="text-white text-lg font-semibold">
            Love me
          </span>
        </motion.div>
        <img
          src={dog.img}
          alt={dog.name}
          className="w-full h-full object-cover"
        />
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 1, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.8,
                times: [0, 0.5, 1],
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <HeartIcon 
                className="h-24 w-24 text-red-500 stroke-[1.5]" 
                style={{ 
                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                }}
              />
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
  );
}; 