import { ReactNode, FC } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { UserRole } from '../types';
import { logger } from '../utils/logger';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute component
 * Guards routes and ensures user is authenticated and has required role
 * @param children - Component to render if access is granted
 * @param allowedRoles - Array of allowed user roles (empty = all authenticated users)
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    logger.debug('No user, redirect to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    logger.debug('Wrong role:', user.role);
    switch (user.role) {
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'nurse':
        return <Navigate to="/nurse-dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin-dashboard" replace />;
      case 'patient':
        return <Navigate to="/patient-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  logger.debug('Access granted for:', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;
