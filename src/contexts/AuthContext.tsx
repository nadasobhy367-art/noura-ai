import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
  type FC,
} from 'react';
import { Navigate } from 'react-router-dom';
import { User, AuthContextType } from '../types';
import { endCurrentSession } from '../utils/analyticsService';
import { authAPI, authTokenStorage } from '../utils/api';
import { logger } from '../utils/logger';
import { useLanguage } from './LanguageContext';

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to use authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Session timeout - 5 minutes of inactivity
const SESSION_TIMEOUT = 5 * 60 * 1000;

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider with session management
 */
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    endCurrentSession('auth_logout');
    authAPI.logout().catch(() => {});
    sessionStorage.clear();
    localStorage.removeItem('noura_remember');
    localStorage.removeItem('last_activity');
    setUser(null);
    window.location.href = '/login';
  }, []);

  // Check session timeout based on last activity
  useEffect(() => {
    const checkSession = () => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity);
        if (elapsed > SESSION_TIMEOUT) {
          logger.info('Session expired after 5 minutes of inactivity');
          logout();
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [logout]);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      localStorage.setItem('last_activity', Date.now().toString());
    };

    // Update activity on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    // Initial activity
    updateActivity();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrateUser = async () => {
      const token = authTokenStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authAPI.getMe();
        if (cancelled) return;
        sessionStorage.setItem('secure_user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (error) {
        logger.error('Session restore failed:', error);
        authTokenStorage.clearToken();
        sessionStorage.removeItem('secure_user');
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrateUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((userData: User) => {
    try {
      logger.debug('Attempting login for user:', userData.userId);

      // Check if there's already an authenticated user (different user)
      const existingUser = sessionStorage.getItem('secure_user');

      if (existingUser) {
        try {
          const existingUserData: User = JSON.parse(existingUser);

          // If trying to login as a different user, logout first then proceed
          if (existingUserData.userId !== userData.userId) {
            logger.debug('Role/User switching detected - clearing previous session');
            logger.debug('Previous user:', existingUserData.userId, 'New user:', userData.userId);

            // Clear the old session
            sessionStorage.clear();
            localStorage.removeItem('last_activity');
            localStorage.removeItem('noura_remember');
            authTokenStorage.clearToken();

            logger.debug('Previous session cleared - proceeding with new login');
          } else {
            logger.debug('Same user logging in again - updating session');
          }
        } catch (e) {
          logger.debug('Could not parse existing user - clearing session');
          sessionStorage.clear();
          authTokenStorage.clearToken();
        }
      } else {
        logger.debug('No existing user found - proceeding with login');
      }

      // Proceed with login for the new user
      sessionStorage.setItem('secure_user', JSON.stringify(userData));
      localStorage.setItem('last_activity', Date.now().toString());
      setUser(userData);
      logger.info('User logged in successfully:', userData.role, `(${userData.name})`);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const newUserData = { ...prevUser, ...updatedData };
      sessionStorage.setItem('secure_user', JSON.stringify(newUserData));
      return newUserData;
    });
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * Protected route component that checks authentication and roles
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.checkingAuth')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const roleRoutes: Record<string, string> = {
      doctor: '/doctor-dashboard',
      nurse: '/nurse-dashboard',
      admin: '/admin-dashboard',
      patient: '/patient-dashboard',
    };
    const redirectPath = roleRoutes[user.role] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default AuthContext;
