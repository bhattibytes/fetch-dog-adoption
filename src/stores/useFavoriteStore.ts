import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoriteStore {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      favorites: [],
      addFavorite: (id) =>
        set((state) => {
          // Remove if exists and add to beginning
          const filteredFavorites = state.favorites.filter(fid => fid !== id);
          return { favorites: [id, ...filteredFavorites] };
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((fid) => fid !== id)
        })),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'dog-favorites-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
); 