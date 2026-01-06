import { getUserById, getUserByEmail, createUser } from '../services/usersService';
import type { User } from '../services/usersService';

export interface Session {
  userId: number;
  token: string;
  expires: string;
}

const SESSION_KEY = 'bookreview_session';
const SESSION_DURATION_DAYS = 7;

// Simple password hashing (for mock only - NOT secure for production)
const hashPassword = (password: string): string => {
  // Simple base64 encoding for demo purposes
  return btoa(password);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getSession();
  if (!session) return false;
  
  // Check expiry
  const expires = new Date(session.expires);
  if (expires < new Date()) {
    clearSession();
    return false;
  }
  
  return true;
};

// Get current session
export const getSession = (): Session | null => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session: Session = JSON.parse(sessionStr);
    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    return null;
  }
};

// Get current user ID
export const getCurrentUserId = (): number | null => {
  const session = getSession();
  return session?.userId || null;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;
  
  try {
    const user = await getUserById(userId);
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Create session
const createSession = (userId: number): Session => {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS);
  
  const session: Session = {
    userId,
    token: `mock-token-${userId}-${Date.now()}`,
    expires: expires.toISOString(),
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

// Clear session
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// Login
export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'No account found with this email.' };
    }

    // For static demo: check if password matches
    // Demo users have plain text password "demo123"
    // New users have hashed passwords
    const userWithPassword = user as any;
    if (userWithPassword.password) {
      // Check if it's a demo user (plain text password)
      if (userWithPassword.password === 'demo123') {
        // Demo user - check plain text
        if (password !== 'demo123') {
          return { success: false, error: 'Incorrect password. Demo password is "demo123".' };
        }
      } else {
        // Regular user - check hashed password
        const hashedPassword = hashPassword(password);
        if (userWithPassword.password !== hashedPassword) {
          return { success: false, error: 'Incorrect password.' };
        }
      }
    } else {
      // If no password stored, accept "demo123" for demo purposes
      if (password !== 'demo123') {
        return { success: false, error: 'Incorrect password. Try "demo123" for demo accounts.' };
      }
    }

    // Create session
    createSession(user.id);

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Unable to log in. Please try again.' };
  }
};

// Signup
export const signup = async (data: {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Validate inputs
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'Name, email, and password are required.' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Validate password length
    if (data.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password for storage (mock only)
    const hashedPassword = hashPassword(data.password);

    // Create user
    const user = await createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword, // Store hashed password
      avatar: data.avatar || '',
      bio: data.bio || '',
    });

    // Create session
    createSession(user.id);

    return { success: true, user };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Unable to create account. Please try again.' };
  }
};

// Logout
export const logout = (): void => {
  clearSession();
};

