import { apiClient } from './apiClient';

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
}

export interface CreateFollowData {
  followerId: number;
  followingId: number;
}

// Check if user is following another user
export const isFollowing = async (
  followerId: number,
  followingId: number
): Promise<boolean> => {
  try {
    const follows = await apiClient.get<Follow[]>(
      `/follows?followerId=${followerId}&followingId=${followingId}`
    );
    return follows.length > 0;
  } catch (err) {
    // If follows endpoint doesn't exist, use localStorage as fallback
    const follows = getFollowsFromStorage();
    return follows.some(
      f => f.followerId === followerId && f.followingId === followingId
    );
  }
};

// Toggle follow (follow if not following, unfollow if following)
export const toggleFollow = async (
  followerId: number,
  followingId: number
): Promise<{ following: boolean }> => {
  try {
    const existing = await apiClient.get<Follow[]>(
      `/follows?followerId=${followerId}&followingId=${followingId}`
    );

    if (existing.length > 0) {
      await apiClient.delete<void>(`/follows/${existing[0].id}`);
      removeFollowFromStorage(followerId, followingId);
      return { following: false };
    } else {
      const newFollow = await apiClient.post<Follow>('/follows', {
        followerId,
        followingId,
      });
      addFollowToStorage(newFollow);
      return { following: true };
    }
  } catch (err) {
    // Fallback to localStorage if API doesn't support follows
    const follows = getFollowsFromStorage();
    const existing = follows.find(
      f => f.followerId === followerId && f.followingId === followingId
    );

    if (existing) {
      removeFollowFromStorage(followerId, followingId);
      return { following: false };
    } else {
      const newFollow: Follow = {
        id: Date.now(),
        followerId,
        followingId,
      };
      addFollowToStorage(newFollow);
      return { following: true };
    }
  }
};

// Get all users that a user is following
export const getFollowing = async (userId: number): Promise<number[]> => {
  try {
    const follows = await apiClient.get<Follow[]>(`/follows?followerId=${userId}`);
    return follows.map(f => f.followingId);
  } catch (err) {
    const follows = getFollowsFromStorage();
    return follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
  }
};

// Get all followers of a user
export const getFollowers = async (userId: number): Promise<number[]> => {
  try {
    const follows = await apiClient.get<Follow[]>(`/follows?followingId=${userId}`);
    return follows.map(f => f.followerId);
  } catch (err) {
    const follows = getFollowsFromStorage();
    return follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
  }
};

// LocalStorage helpers (fallback when API doesn't support follows)
const STORAGE_KEY = 'bookreview_follows';

const getFollowsFromStorage = (): Follow[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addFollowToStorage = (follow: Follow): void => {
  const follows = getFollowsFromStorage();
  if (!follows.find(f => f.id === follow.id)) {
    follows.push(follow);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(follows));
  }
};

const removeFollowFromStorage = (followerId: number, followingId: number): void => {
  const follows = getFollowsFromStorage();
  const filtered = follows.filter(
    f => !(f.followerId === followerId && f.followingId === followingId)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

