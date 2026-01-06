import { apiClient } from './apiClient';

export interface Comment {
  id: number;
  name: string;
  text: string;
  date: string;
  avatar?: string;
}

export interface Blog {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  thumbnail: string;
  authorId: number;
  authorName: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  claps: number;
  comments: number | Comment[];
  shares: number;
  commentsArray?: Comment[];
}

export interface CreateBlogData {
  title: string;
  subtitle: string;
  content: string;
  thumbnail?: string;
  authorId: number;
  authorName: string;
  category: string;
  tags: string[];
  readTime?: string;
}

export interface UpdateBlogData {
  title?: string;
  subtitle?: string;
  content?: string;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  readTime?: string;
  claps?: number;
  comments?: number | Comment[];
  commentsArray?: Comment[];
}

// Get all blogs
export const getBlogs = async (): Promise<Blog[]> => {
  return apiClient.get<Blog[]>('/blogs');
};

// Get blog by ID
export const getBlogById = async (id: number): Promise<Blog> => {
  return apiClient.get<Blog>(`/blogs/${id}`);
};

// Get blogs by author ID
export const getBlogsByAuthorId = async (authorId: number): Promise<Blog[]> => {
  return apiClient.get<Blog[]>(`/blogs?authorId=${authorId}`);
};

// Get trending blogs (sorted by claps, top N)
export const getTrendingBlogs = async (limit: number = 4): Promise<Blog[]> => {
  const blogs = await apiClient.get<Blog[]>('/blogs');
  return blogs
    .sort((a, b) => b.claps - a.claps)
    .slice(0, limit);
};

// Get blogs by category
export const getBlogsByCategory = async (category: string): Promise<Blog[]> => {
  return apiClient.get<Blog[]>(`/blogs?category=${encodeURIComponent(category)}`);
};

// Get blogs by tag
export const getBlogsByTag = async (tag: string): Promise<Blog[]> => {
  return apiClient.get<Blog[]>(`/blogs?tags_like=${encodeURIComponent(tag)}`);
};

// Search blogs by title
export const searchBlogs = async (query: string): Promise<Blog[]> => {
  return apiClient.get<Blog[]>(`/blogs?title_like=${encodeURIComponent(query)}`);
};

// Create a new blog
export const createBlog = async (data: CreateBlogData): Promise<Blog> => {
  const blogData = {
    ...data,
    date: new Date().toISOString().split('T')[0],
    readTime: data.readTime || `${Math.ceil(data.content.split(' ').length / 200)} min read`,
    claps: 0,
    comments: 0,
    shares: 0,
  };
  return apiClient.post<Blog>('/blogs', blogData);
};

// Update a blog
export const updateBlog = async (
  id: number,
  data: UpdateBlogData
): Promise<Blog> => {
  return apiClient.patch<Blog>(`/blogs/${id}`, data);
};

// Delete a blog
export const deleteBlog = async (id: number): Promise<void> => {
  return apiClient.delete<void>(`/blogs/${id}`);
};

// Clap a blog (increment claps)
export const clapBlog = async (id: number, newCount: number): Promise<Blog> => {
  return apiClient.patch<Blog>(`/blogs/${id}`, { claps: newCount });
};

