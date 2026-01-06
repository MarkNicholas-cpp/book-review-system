// Static API Client - Uses in-memory data store instead of HTTP calls
// This makes the app work as a static site for Netlify deployment

import { staticDataStore } from './staticDataStore';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  // Simulate network delay for realism
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', body } = options;
    
    // Simulate network delay
    await this.delay(50 + Math.random() * 100);

    try {
      // Parse endpoint (e.g., "/users/1" or "/reviews?userId=1")
      const [path, queryString] = endpoint.split('?');
      const parts = path.split('/').filter(p => p);
      const resource = parts[0]; // users, reviews, blogs, etc.
      const id = parts[1] ? parseInt(parts[1]) || parts[1] : null;

      let result: any;

      switch (method) {
        case 'GET':
          if (id) {
            // Get by ID
            result = this.getById(resource, id);
          } else {
            // Get all with optional query
            result = this.getAll(resource, queryString);
          }
          break;

        case 'POST':
          result = this.create(resource, body);
          break;

        case 'PUT':
        case 'PATCH':
          if (!id) throw new Error('ID required for update');
          result = this.update(resource, id, body);
          break;

        case 'DELETE':
          if (!id) throw new Error('ID required for delete');
          result = this.deleteResource(resource, id);
          break;
      }

      if (result === null && method !== 'DELETE') {
        throw new Error(`Resource not found: ${endpoint}`);
      }

      return result as T;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  private getById(resource: string, id: number | string): any {
    switch (resource) {
      case 'users':
        return staticDataStore.getUserById(Number(id));
      case 'reviews':
        return staticDataStore.getReviewById(Number(id));
      case 'blogs':
        return staticDataStore.getBlogById(Number(id));
      case 'favorites':
        const favorites = staticDataStore.getFavorites();
        return favorites.find(f => String(f.id) === String(id)) || null;
      case 'genres':
        const genres = staticDataStore.getGenres();
        return genres.find(g => String(g.id) === String(id)) || null;
      case 'follows':
        const follows = staticDataStore.getFollows();
        return follows.find(f => String(f.id) === String(id)) || null;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private getAll(resource: string, queryString?: string): any[] {
    switch (resource) {
      case 'users':
        return staticDataStore.getUsers(queryString);
      case 'reviews':
        return staticDataStore.getReviews(queryString);
      case 'blogs':
        return staticDataStore.getBlogs(queryString);
      case 'favorites':
        return staticDataStore.getFavorites(queryString);
      case 'genres':
        return staticDataStore.getGenres();
      case 'follows':
        return staticDataStore.getFollows(queryString);
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private create(resource: string, data: any): any {
    switch (resource) {
      case 'users':
        return staticDataStore.createUser(data);
      case 'reviews':
        return staticDataStore.createReview(data);
      case 'blogs':
        return staticDataStore.createBlog(data);
      case 'favorites':
        return staticDataStore.createFavorite(data);
      case 'follows':
        return staticDataStore.createFollow(data);
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private update(resource: string, id: number | string, data: any): any {
    switch (resource) {
      case 'users':
        return staticDataStore.updateUser(Number(id), data);
      case 'reviews':
        return staticDataStore.updateReview(Number(id), data);
      case 'blogs':
        return staticDataStore.updateBlog(Number(id), data);
      case 'favorites':
        // Favorites typically don't need updates, but handle it
        const favorites = staticDataStore.getFavorites();
        const fav = favorites.find(f => String(f.id) === String(id));
        if (!fav) return null;
        return { ...fav, ...data };
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  private deleteResource(resource: string, id: number | string): any {
    switch (resource) {
      case 'users':
        // Don't allow deleting default demo users
        const user = staticDataStore.getUserById(Number(id));
        if (user && ['sarah@demo.com', 'emma@demo.com', 'michael@demo.com'].includes(user.email)) {
          throw new Error('Cannot delete demo users');
        }
        return staticDataStore.updateUser(Number(id), { email: `deleted_${Date.now()}@deleted.com` });
      case 'reviews':
        return staticDataStore.deleteReview(Number(id)) ? {} : null;
      case 'blogs':
        return staticDataStore.deleteBlog(Number(id)) ? {} : null;
      case 'favorites':
        return staticDataStore.deleteFavorite(Number(id)) ? {} : null;
      case 'follows':
        return staticDataStore.deleteFollow(Number(id)) ? {} : null;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
