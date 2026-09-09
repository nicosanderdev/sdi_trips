import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/config';

const LANG_CODES = ['en', 'es', 'pt'] as const;

type NavItem = {
  path: string;
  labelKey: string;
};

export function AltNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();

  const navItems: NavItem[] = [
    { path: '/search', labelKey: 'alt.nav.exploreVenues' },
    { path: '/about', labelKey: 'alt.nav.aboutUs' },
    { path: '/contact', labelKey: 'common.contact' },
  ];

  const isActive = (item: NavItem) => {
    if (item.path === '/search') {
      return location.pathname === '/search' || location.pathname.startsWith('/venue/');
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
  };

  const logoBlock = (
    <Link to="/" className="shrink-0 hover:opacity-90 transition-opacity">
      <img
        src="/logo-en-cartelera-alt.png"
        alt="Event venues: En cartelera - Espacios"
        className="h-14 w-auto"
      />
      <p className="hidden lg:block m-0 mt-0.5 text-[10px] text-navy/60 leading-tight max-w-[140px]">
        {t('alt.nav.tagline')}
      </p>
    </Link>
  );

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl" aria-label={t('alt.nav.mainNavAria')}>
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
            <Globe className="h-4 w-4 text-navy shrink-0" aria-hidden />
            <select
              aria-label={t('alt.nav.languageSelectAria')}
              value={LANG_CODES.includes(i18nInstance.language as (typeof LANG_CODES)[number]) ? i18nInstance.language : 'en'}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-sm text-navy font-medium focus:outline-none cursor-pointer max-w-28"
            >
              {LANG_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(`alt.languages.${code}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between gap-2">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo-en-cartelera-alt.png"
              alt="Event venues: En cartelera - Espacios"
              className="h-11 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <select
              aria-label={t('alt.nav.languageSelectAria')}
              value={LANG_CODES.includes(i18nInstance.language as (typeof LANG_CODES)[number]) ? i18nInstance.language : 'en'}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-navy font-medium focus:outline-none cursor-pointer max-w-22"
            >
              {LANG_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(`alt.languages.${code}`)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full text-navy hover:bg-gold hover:text-navy transition-all duration-200"
              aria-expanded={isOpen}
              aria-label={isOpen ? t('alt.nav.closeMenu') : t('alt.nav.openMenu')}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-gold border border-gold/20 p-6">
            <div className="space-y-2">
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
          </div>
        )}
      </div>
    </nav>
  );
}
