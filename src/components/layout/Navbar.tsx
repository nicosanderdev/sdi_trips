import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

type NavItem = {
  path: string;
  labelKey: string;
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();

  const navItems: NavItem[] = [
    { path: '/search', labelKey: 'nav.explore' },
    { path: '/about', labelKey: 'nav.aboutUs' },
    { path: '/contact', labelKey: 'nav.contact' },
  ];

  const isActive = (item: NavItem) => location.pathname === item.path;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const logoBlock = (
    <Link to="/" className="hover:opacity-90 transition-opacity shrink-0">
      <img
        src="/logo-en-cartelera.png"
        alt="Summer rentals: En cartelera - Escapadas"
        className="h-14 w-auto"
      />
      <p className="hidden lg:block m-0 mt-0.5 text-[10px] text-navy/60 leading-tight max-w-[140px]">
        {t('nav.tagline')}
      </p>
    </Link>
  );

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      <div className="bg-white/95 backdrop-blur-md rounded-full px-6 md:px-8 py-4 shadow-gold border border-gold/20">
        <div className="hidden md:flex items-center justify-center gap-3 lg:gap-4">
          {logoBlock}

          <div className="flex items-center space-x-2 lg:space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.labelKey}
                to={item.path}
                className={`px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive(item)
                    ? 'bg-navy text-gold'
                    : 'text-navy hover:bg-gold hover:text-navy'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-1 pl-3 border-l border-gray-300 shrink-0">
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

        <div className="md:hidden flex items-center justify-between">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo-en-cartelera.png"
              alt="Summer rentals: En cartelera - Escapadas"
              className="h-11 w-auto"
            />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-navy hover:bg-gold hover:text-navy transition-all duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-gold border border-gold/20 p-6">
            <div className="space-y-2 mb-6">
              {navItems.map((item) => (
                <Link
                  key={item.labelKey}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item)
                      ? 'bg-navy text-gold'
                      : 'text-navy hover:bg-gold hover:text-navy'
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-200">
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
