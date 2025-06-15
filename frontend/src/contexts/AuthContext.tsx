import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'citizen' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchUser(token);
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = () => {
    // Store the current URL to redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/auth/callback') {
      localStorage.setItem('redirectUrl', currentPath);
    }
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 