import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut } from 'lucide-react';

const LogoutGear = ({ className = '' }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={logout}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/85 px-3 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition hover:bg-white active:bg-white/75 ${className}`.trim()}
      aria-label={t('common.signOut')}
      title={t('common.signOut')}
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">{t('common.signOut')}</span>
    </button>
  );
};

export default LogoutGear;
