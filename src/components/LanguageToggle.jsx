import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle = ({ className = '' }) => {
  const { toggleLanguage, t, isArabic } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-lg backdrop-blur transition hover:bg-white active:bg-white/75 ${className}`.trim()}
      aria-label={t('common.toggleLanguageAriaLabel')}
      title={isArabic ? 'Switch to English' : 'التبديل للعربية'}
    >
      <span>{isArabic ? '🇺🇸' : '🇪🇬'}</span>
      <span>{t('common.languageToggle')}</span>
    </button>
  );
};

export default LanguageToggle;
