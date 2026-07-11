import { useEffect, useState, type FC } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './contexts/AuthContext';
import LanguageToggle from './components/LanguageToggle';
import LogoutGear from './components/LogoutGear';
import ArabicTextRuntime from './components/ArabicTextRuntime';
import './App.css';

// Import actual pages
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PatientHomePage from './pages/PatientHomePage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ResultsPage from './pages/ResultsPage';
import UploadPage from './pages/UploadPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import RecognitionDashboard from './pages/RecognitionDashboard';
import AuditLogsPage from './pages/AuditLogsPage';
import TeamManagement from './pages/TeamManagement';
import AIChatbot from './pages/AIChatbot';
import { logger } from './utils/logger';

/**
 * Redirect based on user role
 */
const RoleBasedRedirect: FC = () => {
  const userStr = sessionStorage.getItem('secure_user') || '{}';
  const user = JSON.parse(userStr) as { role?: string };

  if (!user || !user.role) return <Navigate to="/login" replace />;

  const roleRoutes: Record<string, string> = {
    doctor: '/doctor-dashboard',
    nurse: '/nurse-dashboard',
    admin: '/admin-dashboard',
    patient: '/patient-dashboard',
  };

  return <Navigate to={roleRoutes[user.role] || '/login'} replace />;
};

/**
 * Loading screen component
 */
const LoadingScreen: FC = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t('common.loadingTitle')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          {t('common.loadingSubtitle')}
        </p>
      </div>
    </div>
  );
};

/**
 * Main application shell content (inside language provider)
 */
const AppShellContent: FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('Noura AI System Initialized');
    logger.info('Access Control: Active');
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <ArabicTextRuntime />
            <div className="language-toggle-anchor fixed top-4 right-4 z-[1000] flex items-center gap-3">
              <LanguageToggle />
              <LogoutGear />
            </div>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/" element={<RoleBasedRedirect />} />

              {/* Protected Patient Routes */}
              <Route
                path="/patient-home"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Doctor Routes */}
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Nurse Routes */}
              <Route
                path="/nurse-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['nurse']}>
                    <NurseDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Protected Routes - FULL PAGES */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'nurse']}>
                    <UploadPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/results"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse']}>
                    <ResultsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/messages"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse']}>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse', 'admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/help"
                element={
                  <ProtectedRoute>
                    <HelpPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/appointments"
                element={
                  <ProtectedRoute allowedRoles={['patient', 'doctor', 'nurse']}>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recognition-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <RecognitionDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/team-management"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TeamManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<RoleBasedRedirect />} />
            </Routes>

            {/* AI Chatbot - available on all protected pages */}
            <AIChatbot />
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

/**
 * Main application shell with language provider
 */
function App() {
  return (
    <LanguageProvider>
      <AppShellContent />
    </LanguageProvider>
  );
}

export default App;
