import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const ForgotPasswordPage = () => {
  // const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { t, isArabic } = useLanguage();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError(t('forgotPassword.validation.enterEmail'));
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage(t('forgotPassword.validation.sent', { email }));
      setEmail('');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('forgotPassword.title')}</h2>
            <p className="text-gray-600 text-sm">{t('forgotPassword.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✅ {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {t('forgotPassword.emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                placeholder={t('forgotPassword.emailPlaceholder')}
                required
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {loading ? (
                <>
                  <div
                    className={`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ${isArabic ? 'ml-2' : 'mr-2'}`}
                  ></div>
                  {t('forgotPassword.sending')}
                </>
              ) : (
                <>
                  <span className={`${isArabic ? 'ml-2' : 'mr-2'}`}>📧</span>
                  {t('forgotPassword.submit')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {t('forgotPassword.rememberPassword')}{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                {t('forgotPassword.backToLogin')}
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-xs">
              <p className="mb-2">{t('forgotPassword.securityNote')}</p>
              <p>{t('forgotPassword.spamNote')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">© 2026 Noura AI System. All rights reserved.</p>
          <p className="text-gray-400 text-xs mt-1">{t('forgotPassword.footer')}</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
