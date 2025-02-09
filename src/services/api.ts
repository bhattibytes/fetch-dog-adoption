import { Coordinates } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
}

export const login = async (name: string, email: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response;
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export const searchDogs = async (params: {
  breeds?: string[];
  zipCodes?: string[];
  ageMin?: number;
  ageMax?: number;
  size?: number;
  from?: string;
  sort?: string;
}) => {
  const searchParams = new URLSearchParams();
  
  if (params.breeds?.length) {
    params.breeds.forEach(breed => searchParams.append('breeds', breed));
  }
  if (params.zipCodes?.length) {
    params.zipCodes.forEach(zip => searchParams.append('zipCodes', zip));
  }
  if (params.ageMin) searchParams.append('ageMin', params.ageMin.toString());
  if (params.ageMax) searchParams.append('ageMax', params.ageMax.toString());
  if (params.size) searchParams.append('size', params.size.toString());
  if (params.from) searchParams.append('from', params.from);
  if (params.sort) searchParams.append('sort', params.sort);

  const response = await fetch(`${API_URL}/dogs/search?${searchParams}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Dog search failed');
  }

  return response.json();
};

export const getDogsByIds = async (ids: string[]) => {
  const response = await fetch(`${API_URL}/dogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dogs');
  }

  return response.json();
};

export const getBreeds = async () => {
  const response = await fetch(`${API_URL}/dogs/breeds`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch breeds');
  }

  return response.json();
};

export const generateMatch = async (dogIds: string[]) => {
  const response = await fetch(`${API_URL}/dogs/match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dogIds),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to generate match');
  }

  return response.json();
};

export const searchLocations = async (params: {
  city?: string;
  states?: string[];
  geoBoundingBox?: {
    top: Coordinates;
    left: Coordinates;
    bottom: Coordinates;
    right: Coordinates;
  };
  size?: number;
}) => {
  try {
    const response = await fetch(`${API_URL}/locations/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        geoBoundingBox: params.geoBoundingBox ? {
          bottom_left: {
            lat: params.geoBoundingBox.bottom.lat,
            lon: params.geoBoundingBox.left.lon
          },
          top_right: {
            lat: params.geoBoundingBox.top.lat,
            lon: params.geoBoundingBox.right.lon
          }
        } : undefined
      }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Location search failed: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Location search error:', error);
    throw error;
  }
}; 