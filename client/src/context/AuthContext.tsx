import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreferences } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  savedPropertyIds: string[];
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updatePreferences: (prefs: UserPreferences) => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string }) => Promise<void>;
  isPropertySaved: (propertyId: string) => boolean;
  toggleSaveProperty: (propertyId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('staywise_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem('staywise_local_saved');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.getMe();
        setUser(user);
        // Load user favorites from backend
        try {
          const { favorites } = await api.getFavorites();
          setSavedPropertyIds(favorites.map((f) => f._id));
        } catch {
          // ignore favorite fetch error
        }
      } catch (err) {
        console.warn('Auth check failed:', err);
        localStorage.removeItem('staywise_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token]);

  // Sync local favorites storage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('staywise_local_saved', JSON.stringify(savedPropertyIds));
    }
  }, [savedPropertyIds, user]);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    localStorage.setItem('staywise_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    localStorage.setItem('staywise_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('staywise_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (prefs: UserPreferences) => {
    const res = await api.updatePreferences(prefs);
    if (user) {
      setUser({ ...user, preferences: { ...user.preferences, ...res.preferences } });
    }
  };

  const updateProfile = async (payload: { name?: string; phone?: string }) => {
    const res = await api.updateProfile(payload);
    setUser(res.user);
  };

  const isPropertySaved = (propertyId: string) => {
    return savedPropertyIds.includes(propertyId);
  };

  const toggleSaveProperty = async (propertyId: string) => {
    if (user) {
      const res = await api.toggleFavorite(propertyId);
      if (res.isSaved) {
        setSavedPropertyIds((prev) => [...prev, propertyId]);
      } else {
        setSavedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
      }
    } else {
      // Local fallback for guest users
      setSavedPropertyIds((prev) => {
        const isSaved = prev.includes(propertyId);
        if (isSaved) {
          return prev.filter((id) => id !== propertyId);
        } else {
          return [...prev, propertyId];
        }
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        savedPropertyIds,
        login,
        register,
        logout,
        updatePreferences,
        updateProfile,
        isPropertySaved,
        toggleSaveProperty,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
