// API Client
export { apiClient } from './apiClient';

// Reviews Service - export everything except Comment to avoid conflict
export type { Review, CreateReviewData, UpdateReviewData } from './reviewsService';
export { 
  getReviews, 
  getReviewById, 
  getReviewsByGenre, 
  getReviewsByUserId, 
  searchReviews, 
  createReview, 
  updateReview, 
  deleteReview 
} from './reviewsService';
// Export Comment from reviewsService with explicit name
export type { Comment as ReviewComment } from './reviewsService';

// Blogs Service - export everything except Comment to avoid conflict
export type { Blog, CreateBlogData, UpdateBlogData } from './blogsService';
export { 
  getBlogs, 
  getBlogById, 
  getBlogsByAuthorId, 
  getTrendingBlogs, 
  getBlogsByCategory, 
  getBlogsByTag, 
  searchBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  clapBlog 
} from './blogsService';
// Export Comment from blogsService with explicit name
export type { Comment as BlogComment } from './blogsService';

// Users Service
export * from './usersService';

// Favorites Service
export * from './favoritesService';

// Genres Service
export * from './genresService';

