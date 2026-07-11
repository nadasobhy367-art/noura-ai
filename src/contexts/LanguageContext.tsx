import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from 'react';
import { translations } from '../locales/translations';
import { LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | null>(null);

const DEFAULT_LANGUAGE: 'en' = 'en';
const STORAGE_KEY = 'noura_language';

/**
 * Get nested value from object by dot-separated path
 */
const getNestedValue = (object: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce((value: unknown, key) => {
    if (typeof value === 'object' && value !== null && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, object);

/**
 * Interpolate template string with values
 */
const interpolate = (template: unknown, values: Record<string, unknown> = {}): string => {
  if (typeof template !== 'string') return String(template);
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
};

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Language context provider for i18n
 */
export const LanguageProvider: FC<LanguageProviderProps> = ({ children }) => {
  const getInitialLanguage = (): 'ar' | 'en' => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    return savedLanguage === 'ar' || savedLanguage === 'en' ? savedLanguage : DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<'ar' | 'en'>(getInitialLanguage);

  useEffect(() => {
    const direction = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: 'ar' | 'en') => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState(current => (current === 'ar' ? 'en' : 'ar'));
  }, []);

  const value: LanguageContextType = useMemo(() => {
    const dictionary =
      (translations as Record<'ar' | 'en', Record<string, unknown>>)[language] ||
      (translations as Record<'ar' | 'en', Record<string, unknown>>)[DEFAULT_LANGUAGE];

    return {
      language,
      isArabic: language === 'ar',
      setLanguage,
      toggleLanguage,
      t: (path: string, values?: Record<string, unknown>) => {
        const localized = getNestedValue(dictionary, path);
        const fallback = getNestedValue(
          (translations as Record<'ar' | 'en', Record<string, unknown>>)[DEFAULT_LANGUAGE],
          path
        );
        return interpolate(localized ?? fallback ?? path, values);
      },
      getObject: (path: string) => {
        const localized = getNestedValue(dictionary, path);
        return (
          localized ??
          getNestedValue(
            (translations as Record<'ar' | 'en', Record<string, unknown>>)[DEFAULT_LANGUAGE],
            path
          )
        );
      },
    };
  }, [language, setLanguage, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

/**
 * Hook to use language context
 * @throws Error if used outside LanguageProvider
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
