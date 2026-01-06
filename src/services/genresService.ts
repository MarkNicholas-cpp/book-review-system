import { apiClient } from './apiClient';

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Get all genres
export const getGenres = async (): Promise<Genre[]> => {
  return apiClient.get<Genre[]>('/genres');
};

// Get genre by ID
export const getGenreById = async (id: number): Promise<Genre> => {
  return apiClient.get<Genre>(`/genres/${id}`);
};

// Get genre by slug
export const getGenreBySlug = async (slug: string): Promise<Genre | null> => {
  const genres = await apiClient.get<Genre[]>(`/genres?slug=${encodeURIComponent(slug)}`);
  return genres.length > 0 ? genres[0] : null;
};

