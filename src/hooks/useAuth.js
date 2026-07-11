import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { logger } from '../utils/logger';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // فحص المستخدم الحالي عند التحميل
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (sessionStorage.getItem('auth_token')) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authAPI.login(email, password);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      logger.error('Logout error:', err);
    } finally {
      setUser(null);
      sessionStorage.removeItem('auth_token');
    }
  };

  return { user, loading, error, login, logout, isAuthenticated: !!user };
};
