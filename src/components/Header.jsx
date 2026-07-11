import React from 'react';
import { useContext } from 'react';
import { Menu, X, LogIn, Heart } from 'lucide-react';
import ThemeContext from '../contexts/ThemeContext';
import NouraLogo from './NouraLogo';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const themeContext = useContext(ThemeContext) || { isDark: false, toggleTheme: () => {} };
  const isDark = themeContext.isDark || false;

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700'
          : 'bg-gradient-to-r from-blue-50 via-white to-green-50 border-blue-100'
      } backdrop-blur-md border-b shadow-lg dark:shadow-blue-900/20`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div
                className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-lg ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-r from-blue-400 to-green-400'
                }`}
              />
              <NouraLogo size={58} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xl font-bold transition-colors duration-300 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent'
                  }`}
                >
                  NOURA AI
                </span>
                <Heart
                  className={`h-5 w-5 transition-all duration-300 ${
                    isDark ? 'text-red-400' : 'text-red-500'
                  } animate-pulse`}
                />
              </div>
              <span
                className={`text-xs font-semibold tracking-wider transition-colors duration-300 ${
                  isDark
                    ? 'text-blue-300/80 group-hover:text-blue-200'
                    : 'text-blue-600/80 group-hover:text-blue-700'
                }`}
              >
                Medical Intelligence Platform
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <a
                key={item.name}
                href={item.href}
                className={`px-4 py-2 font-medium transition-all duration-300 relative group rounded-lg ${
                  isDark
                    ? 'text-gray-300 hover:text-blue-300 hover:bg-blue-900/20'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.name}
                <span
                  className={`absolute bottom-1 left-4 w-0 h-1 transition-all duration-300 group-hover:w-[calc(100%-32px)] rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500`}
                />
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Desktop Login Button */}
            <a
              href="/login"
              className={`hidden md:inline-flex items-center px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 active:scale-95'
                  : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg hover:shadow-blue-400/50 hover:scale-105 active:scale-95'
              }`}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </a>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
                isDark ? 'hover:bg-blue-900/30 text-gray-300' : 'hover:bg-blue-100 text-gray-700'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden mt-4 pt-4 border-t transition-all duration-300 ${
              isDark ? 'border-blue-900/30' : 'border-blue-100'
            } animate-in slide-in-from-top-2 duration-200`}
          >
            <div className="flex flex-col space-y-2">
              {navItems.map(item => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isDark
                      ? 'text-gray-300 hover:bg-blue-900/30 hover:text-blue-300'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="/login"
                className={`mt-4 py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-center ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/50'
                    : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:shadow-lg hover:shadow-blue-400/50'
                }`}
              >
                <LogIn className="h-4 w-4 inline mr-2" />
                Login
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
