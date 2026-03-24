import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();

  const navItems = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/search', labelKey: 'nav.explore' },
    { path: '/contact', labelKey: 'nav.contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-gold border border-gold/20">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="text-navy font-bold text-xl hover:text-gold transition-colors">
            {t('nav.logo')}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-navy text-gold'
                    : 'text-navy hover:bg-gold hover:text-navy'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1 ml-4 pl-4 border-l border-gray-300">
              <Globe className="h-4 w-4 text-navy" />
              <select
                value={i18nInstance.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm text-navy font-medium focus:outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between">
          <Link to="/" className="text-navy font-bold text-lg">
            {t('nav.logo')}
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-navy hover:bg-gold hover:text-navy transition-all duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-gold border border-gold/20 p-6">
            {/* Mobile Navigation Links */}
            <div className="space-y-2 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-navy text-gold'
                      : 'text-navy hover:bg-gold hover:text-navy'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>

            {/* Mobile Language Switcher */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-4">
                <Globe className="h-5 w-5 text-navy" />
                <select
                  value={i18nInstance.language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-navy font-medium focus:outline-none cursor-pointer"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
