import { apiClient } from './apiClient';

export interface Favorite {
  id: number;
  userId: number;
  type: 'review' | 'blog';
  itemId: number;
}

export interface CreateFavoriteData {
  userId: number;
  type: 'review' | 'blog';
  itemId: number;
}

// Get all favorites for a user
export const getFavorites = async (userId: number): Promise<Favorite[]> => {
  return apiClient.get<Favorite[]>(`/favorites?userId=${userId}`);
};

// Get favorites by type
export const getFavoritesByType = async (
  userId: number,
  type: 'review' | 'blog'
): Promise<Favorite[]> => {
  return apiClient.get<Favorite[]>(`/favorites?userId=${userId}&type=${type}`);
};

// Check if item is favorited
export const isFavorited = async (
  userId: number,
  type: 'review' | 'blog',
  itemId: number
): Promise<boolean> => {
  const favorites = await apiClient.get<Favorite[]>(
    `/favorites?userId=${userId}&type=${type}&itemId=${itemId}`
  );
  return favorites.length > 0;
};

// Add a favorite
export const addFavorite = async (data: CreateFavoriteData): Promise<Favorite> => {
  return apiClient.post<Favorite>('/favorites', data);
};

// Remove a favorite
export const removeFavorite = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`/favorites/${id}`);
};

// Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = async (
  userId: number,
  type: 'review' | 'blog',
  itemId: number
): Promise<{ favorited: boolean; favoriteId?: number }> => {
  const existing = await apiClient.get<Favorite[]>(
    `/favorites?userId=${userId}&type=${type}&itemId=${itemId}`
  );

  if (existing.length > 0) {
    await removeFavorite(existing[0].id);
    return { favorited: false };
  } else {
    const newFavorite = await addFavorite({ userId, type, itemId });
    return { favorited: true, favoriteId: newFavorite.id };
  }
};

