import { createContext, useContext, useState, useEffect } from 'react';
import { verifySession, logoutApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifySession()
      .then((sessionUser) => setUser(sessionUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (newUser) => {
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // cookie may already be gone
    }
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
