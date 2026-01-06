import { apiClient } from './apiClient';

export interface Comment {
  id: number;
  author: string;
  avatar?: string;
  text: string;
  date: string;
}

export interface Review {
  id: number;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  reviewPreview: string;
  userId: number;
  reviewerName: string;
  date: string;
  likes: number;
  comments: number | Comment[];
  genre: string;
  isbn?: string;
}

export interface CreateReviewData {
  bookTitle: string;
  bookAuthor: string;
  coverImage?: string;
  rating: number;
  reviewTitle: string;
  reviewText: string;
  userId: number;
  reviewerName: string;
  genre: string;
  isbn?: string;
}

export interface UpdateReviewData {
  bookTitle?: string;
  bookAuthor?: string;
  coverImage?: string;
  rating?: number;
  reviewTitle?: string;
  reviewText?: string;
  reviewPreview?: string;
  genre?: string;
  isbn?: string;
  likes?: number;
  comments?: number | Comment[];
  commentsArray?: Comment[];
}

// Get all reviews
export const getReviews = async (): Promise<Review[]> => {
  return apiClient.get<Review[]>('/reviews');
};

// Get review by ID
export const getReviewById = async (id: number): Promise<Review> => {
  return apiClient.get<Review>(`/reviews/${id}`);
};

// Get reviews by genre
export const getReviewsByGenre = async (genre: string): Promise<Review[]> => {
  return apiClient.get<Review[]>(`/reviews?genre=${encodeURIComponent(genre)}`);
};

// Get reviews by user ID
export const getReviewsByUserId = async (userId: number): Promise<Review[]> => {
  return apiClient.get<Review[]>(`/reviews?userId=${userId}`);
};

// Search reviews by book title
export const searchReviews = async (query: string): Promise<Review[]> => {
  return apiClient.get<Review[]>(`/reviews?bookTitle_like=${encodeURIComponent(query)}`);
};

// Create a new review
export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const reviewData = {
    ...data,
    reviewPreview: data.reviewText.substring(0, 150) + '...',
    date: new Date().toISOString().split('T')[0],
    likes: 0,
    comments: 0,
  };
  return apiClient.post<Review>('/reviews', reviewData);
};

// Update a review
export const updateReview = async (
  id: number,
  data: UpdateReviewData
): Promise<Review> => {
  return apiClient.patch<Review>(`/reviews/${id}`, data);
};

// Delete a review
export const deleteReview = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`/reviews/${id}`);
};

