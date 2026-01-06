import { apiClient } from './apiClient';
import type { Review } from './reviewsService';
import type { Blog } from './blogsService';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  password?: string; // Optional for existing users without passwords
  stats: {
    blogs: number;
    reviews: number;
    favorites: number;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  return apiClient.get<User[]>('/users');
};

// Get user by ID
export const getUserById = async (id: number): Promise<User> => {
  return apiClient.get<User>(`/users/${id}`);
};

// Get user by email (for login)
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const users = await apiClient.get<User[]>(`/users?email=${encodeURIComponent(email)}`);
  return users.length > 0 ? users[0] : null;
};

// Get user reviews
export const getUserReviews = async (userId: number): Promise<Review[]> => {
  return apiClient.get<Review[]>(`/reviews?userId=${userId}`);
};

// Get user blogs
export const getUserBlogs = async (userId: number): Promise<Blog[]> => {
  return apiClient.get<Blog[]>(`/blogs?authorId=${userId}`);
};

// Create a new user (for signup)
export const createUser = async (data: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
}): Promise<User> => {
  const userData = {
    ...data,
    avatar: data.avatar || '',
    bio: data.bio || '',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    stats: {
      blogs: 0,
      reviews: 0,
      favorites: 0,
    },
  };
  return apiClient.post<User>('/users', userData);
};

// Update user
export const updateUser = async (
  id: number,
  data: UpdateUserData
): Promise<User> => {
  return apiClient.patch<User>(`/users/${id}`, data);
};

// Update user stats
export const updateUserStats = async (
  id: number,
  stats: { blogs?: number; reviews?: number; favorites?: number }
): Promise<User> => {
  const user = await getUserById(id);
  return apiClient.patch<User>(`/users/${id}`, {
    stats: {
      ...user.stats,
      ...stats,
    },
  });
};

