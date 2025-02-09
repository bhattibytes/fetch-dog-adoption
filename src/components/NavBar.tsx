import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MapIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useFavoriteStore } from '../stores/useFavoriteStore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import * as api from '../services/api';

interface NavBarProps {
  title?: string;
}

export const NavBar: React.FC<NavBarProps> = () => {
  const router = useRouter();
  const { favorites } = useFavoriteStore();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/'); // Navigate to login page
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const handleGenerateMatch = async () => {
    if (favorites.length === 0) {
      toast.error('Please favorite some dogs first!');
      return;
    }

    try {
      const match = await api.generateMatch(favorites);
      const [matchedDog] = await api.getDogsByIds([match.match]);
      router.push('/match');
      toast.success(`You've been matched with ${matchedDog.name}!`);
    } catch (error) {
      toast.error('Failed to generate match');
    }
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Link
            href="/map"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              ${router.pathname === '/map' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-blue-500 hover:bg-blue-50'}`}
          >
            <MapIcon className="h-5 w-5" />
            <span>Map Search</span>
          </Link>
          <Link
            href="/search"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              ${router.pathname === '/search' 
                ? 'bg-purple-50 text-purple-600' 
                : 'text-purple-500 hover:bg-purple-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <span>Search Dogs</span>
          </Link>
          <Link
            href="/favorites"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              ${router.pathname === '/favorites' 
                ? 'bg-red-50 text-red-600' 
                : 'text-red-500 hover:bg-red-50'}`}
          >
            <HeartIcon className="h-5 w-5" />
            <span>Favorites ({favorites.length})</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerateMatch}
          className={`px-4 py-2 rounded-md transition-colors
            ${router.pathname === '/match'
              ? 'bg-green-700 text-white'
              : 'bg-green-600 text-white hover:bg-green-700'}`}
        >
          Generate Match
        </button>
        <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
          <span className="text-gray-700">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Logout"
          >
            <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}; 