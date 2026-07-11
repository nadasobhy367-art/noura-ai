import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  secureSetItem,
  secureGetItem,
  secureRemoveItem,
  sanitizeInput,
} from '../utils/securityUtils';
import { authAPI } from '../utils/api';
import { Sun, Moon } from 'lucide-react';
import NouraLogoFinal, { NouraLogoHero } from '../components/NouraLogo';
import { logAuditEvent, startUserSession } from '../utils/analyticsService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LoginPage = () => {
  const [role, setRole] = useState('doctor');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, getObject, isArabic } = useLanguage();

  // Theme handled by ThemeContext (persists to localStorage and toggles class)

  // ── Constants ──────────────────────────────────────────────────
  const rolePrefixes = { doctor: 'DR-', nurse: 'NU-', patient: 'PT-', admin: 'AD-' };
  const roleIcons = { doctor: '👨‍⚕️', nurse: '💉', patient: '👤', admin: '⚙️' };

  // Memoize to update when language changes
  const { roleLabels, featureCards, bottomStrip } = useMemo(
    () => ({
      roleLabels: getObject('login.roleLabels'),
      featureCards: getObject('login.featureCards'),
      bottomStrip: getObject('login.bottomStrip'),
    }),
    [getObject]
  );

  // ── Validation ─────────────────────────────────────────────────
  const validateInputs = () => {
    if (!userId.trim()) return t('login.validation.enterId');
    if (!password.trim()) return t('login.validation.enterPassword');

    const trimmedUserId = userId.trim().toUpperCase();
    const expectedPrefix = rolePrefixes[role];
    if (!trimmedUserId.startsWith(expectedPrefix))
      return t('login.validation.idPrefix', { prefix: expectedPrefix, role: roleLabels[role] });

    if (password.length < 6) return t('login.validation.shortPassword');

    if (!/^[A-Z]{2,3}-\d{4}-\d{3}$/.test(trimmedUserId)) return t('login.validation.invalidId');

    return null;
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanUserId = sanitizeInput(userId.trim().toUpperCase());
    const cleanPassword = sanitizeInput(password.trim());
    setLoading(true);

    try {
      const apiUser = await authAPI.login(cleanUserId, cleanPassword, role);
      login(apiUser);
      startUserSession(apiUser);
      logAuditEvent({
        action: 'LOGIN',
        status: 'success',
        details: `Successful login for ${apiUser.userId}`,
        user: apiUser,
        sessionId: apiUser.sessionId,
      });

      if (rememberDevice) {
        secureSetItem('remember', {
          userId: cleanUserId,
          role: apiUser.role,
          rememberUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        secureRemoveItem('remember');
      }

      setLoading(false);
      setTimeout(() => {
        switch (apiUser.role) {
          case 'doctor':
            navigate('/doctor-dashboard', { replace: true });
            break;
          case 'nurse':
            navigate('/nurse-dashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin-dashboard', { replace: true });
            break;
          case 'patient':
            const hasVisited = localStorage.getItem('patient_has_visited');
            navigate(hasVisited === 'true' ? '/patient-dashboard' : '/patient-home', {
              replace: true,
            });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }, 100);
    } catch (err) {
      logAuditEvent({
        action: 'LOGIN_FAILED',
        status: 'failed',
        details: `Failed login attempt for ${cleanUserId}`,
        user: { userId: cleanUserId, name: 'Unknown', role },
      });
      setError(err.message || t('login.validation.invalidCredentials'));
      setLoading(false);
    }
  };

  // ── Load remembered device ─────────────────────────────────────
  useEffect(() => {
    try {
      const remembered = secureGetItem('remember');
      if (
        remembered &&
        remembered.rememberUntil &&
        new Date(remembered.rememberUntil) > new Date()
      ) {
        setUserId(remembered.userId || '');
        setRole(remembered.role || 'patient');
        setRememberDevice(true);
      }
    } catch {
      secureRemoveItem('remember');
    }
  }, []);

  // ── Dev reset ──────────────────────────────────────────────────
  const handleResetSystem = () => {
    if (window.confirm(`⚠️ ${t('login.confirmReset')}`)) {
      localStorage.clear();
      sessionStorage.clear();
      setUserId('');
      setPassword('');
      setRememberDevice(false);
      setError('');
      alert(`✅ ${t('login.resetSuccess')}`);
    }
  };

  // ── Shared input classes ───────────────────────────────────────
  const inputClass = `w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed
    ${
      isDark
        ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
        : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400'
    }`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  // ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img src={process.env.PUBLIC_URL + "/assets/images/login-bg.jpg"} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ════════════ LEFT — Branding ════════════ */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 min-h-[60vh] lg:min-h-screen">
        <div className="max-w-xl text-center">
          {/* Hero logo */}
          <div className="mb-8 flex justify-center">
            <NouraLogoHero size={69} />
          </div>

          <h1 className="text-6xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
            {t('login.pageTitle')}
          </h1>

          <div className="inline-block px-8 py-6 bg-white/20 backdrop-blur-lg rounded-3xl border-2 border-white/30 shadow-2xl mb-10">
            <p className="text-2xl text-white font-medium leading-relaxed">
              {t('login.heroTitle')}
              <br />
              <span className="text-3xl font-bold mt-3 block text-blue-200">
                {t('login.heroHighlight')}
              </span>
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
            {featureCards.map((item, i) => (
              <div
                key={i}
                className="text-center p-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-white font-bold text-base mb-1">{item.title}</div>
                <div className="text-white/90 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>

          <p className="text-white/90 text-lg leading-relaxed font-medium mb-8 px-6">
            {t('login.heroDescription')}
          </p>

          {/* Bottom icon strip */}
          <div className="flex justify-center gap-8">
            {bottomStrip.map(([ic, lb]) => (
              <div key={lb} className="text-white/80 text-sm flex flex-col items-center">
                <span className="text-2xl mb-1">{ic}</span>
                <span>{lb}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════ RIGHT — Login Form ════════════ */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 min-h-screen">
        <div className="max-w-md w-full">
          <div
            className={`rounded-2xl shadow-xl p-8 border ${
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white/95 backdrop-blur-sm border-gray-200'
            }`}
          >
            {/* Theme toggle */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isDark
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <NouraLogoFinal size={92} variant="full" animated={true} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('login.accessTitle')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('login.accessSubtitle')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Role selection */}
              <div className="mb-6">
                <label className={labelClass}>{t('login.selectRole')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {['doctor', 'nurse', 'patient', 'admin'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      disabled={loading}
                      className={`py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center
                        ${
                          role === r
                            ? 'bg-blue-500 text-white shadow-md'
                            : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`${isArabic ? 'ml-2' : 'mr-2'} text-lg`}>
                        {roleIcons[r]}
                      </span>
                      {roleLabels[r]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID input */}
              <div className="mb-6">
                <label className={labelClass}>
                  {t('login.userIdLabel', { role: roleLabels[role] })}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-mono">
                    {rolePrefixes[role]}
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    disabled={loading}
                    className={`${inputClass} pl-12`}
                    placeholder={t('login.idPlaceholder')}
                    required
                    autoComplete="username"
                    dir="ltr"
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t('login.examplePrefix', { prefix: rolePrefixes[role] })}
                </p>
              </div>

              {/* Password input */}
              <div className="mb-6">
                <label className={labelClass}>{t('login.passwordLabel')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  minLength="6"
                  autoComplete="current-password"
                />
              </div>

              {/* Remember + Forgot */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberDevice}
                    onChange={e => setRememberDevice(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400 disabled:opacity-50"
                  />
                  <label
                    htmlFor="remember"
                    className={`${isArabic ? 'mr-2' : 'ml-2'} text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('login.rememberDevice')}
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
                >
                  {t('login.forgotPassword')}
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg
                  font-medium hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed
                  flex items-center justify-center text-sm"
              >
                {loading ? (
                  <>
                    <div
                      className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`}
                    />
                    {t('login.authenticate')}
                  </>
                ) : (
                  <>
                    <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>🔐</span>
                    {t('login.submit')}
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              {/* Security badges */}
              <div
                className={`mb-4 p-3 rounded-lg border text-xs text-center ${
                  isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <p className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-gray-700'}`}>
                  🔒 {t('login.securityFeatures')}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['AES-256', 'HIPAA', 'Access Control'].map(b => (
                    <span
                      key={b}
                      className={`px-2 py-1 rounded text-xs ${
                        isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className={`text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="font-medium mb-1">{t('login.needHelp')}</p>
                <p>Email: support@noura-ai.com</p>
                <p>Phone: +20 100 000 0000</p>
              </div>

              {/* Dev reset */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  className={`mt-4 pt-3 text-center border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
                >
                  <button
                    onClick={handleResetSystem}
                    className="text-gray-500 hover:text-blue-600 text-xs underline flex items-center justify-center mx-auto"
                  >
                    <span className={`${isArabic ? 'ml-1' : 'mr-1'}`}>🧪</span>
                    {t('login.resetSystem')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
