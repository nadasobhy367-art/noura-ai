import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
  type FC,
} from 'react';
import { ThemeContextType } from '../types';

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Hook to use theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme context provider for dark/light mode
 */
export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  // Initialize from localStorage BEFORE first render
  const getInitialTheme = (): boolean => {
    const saved = localStorage.getItem('noura_theme');
    if (saved === 'dark') {
      // Apply immediately
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  };

  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Already initialized, just sync if needed
    const savedTheme = localStorage.getItem('noura_theme');
    const shouldBeDark = savedTheme === 'dark';
    if (shouldBeDark !== isDark) {
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prevIsDark => {
      const newTheme = !prevIsDark;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('noura_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('noura_theme', 'light');
      }
      return newTheme;
    });
  }, []);

  const setTheme = useCallback((dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('noura_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('noura_theme', 'light');
    }
  }, []);

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    setIsDark: setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
