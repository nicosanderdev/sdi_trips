import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n/config';

const LANG_CODES = ['en', 'es', 'pt'] as const;

export function AltNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();

  const navItems = [
    { path: '/', labelKey: 'common.home' as const },
    { path: '/search', labelKey: 'nav.explore' as const },
    { path: '/contact', labelKey: 'common.contact' as const },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/search') return location.pathname === '/search' || location.pathname.startsWith('/venue/');
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const changeLanguage = (code: string) => {
    void i18n.changeLanguage(code);
  };

  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl"
      aria-label={t('alt.nav.mainNavAria')}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 shadow-gold border border-gold/20">
        <div className="hidden md:flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="text-navy font-bold text-xl hover:text-gold transition-colors shrink-0">
            {t('alt.brand.venue')}
            <span className="text-venue-accent">{t('alt.brand.space')}</span>
          </Link>
          <div className="flex items-center flex-wrap justify-end gap-1 sm:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-navy text-gold'
                    : 'text-navy hover:bg-gold hover:text-navy'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <div className="flex items-center gap-1 ml-2 pl-3 border-l border-gray-300">
              <Globe className="h-4 w-4 text-navy shrink-0" aria-hidden />
              <select
                aria-label={t('alt.nav.languageSelectAria')}
                value={LANG_CODES.includes(i18nInstance.language as (typeof LANG_CODES)[number]) ? i18nInstance.language : 'en'}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm text-navy font-medium focus:outline-none cursor-pointer max-w-[7rem]"
              >
                {LANG_CODES.map((code) => (
                  <option key={code} value={code}>
                    {t(`alt.languages.${code}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between gap-2">
          <Link to="/" className="text-navy font-bold text-lg">
            {t('alt.brand.venue')}
            <span className="text-venue-accent">{t('alt.brand.space')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <select
              aria-label={t('alt.nav.languageSelectAria')}
              value={LANG_CODES.includes(i18nInstance.language as (typeof LANG_CODES)[number]) ? i18nInstance.language : 'en'}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs text-navy font-medium focus:outline-none cursor-pointer max-w-[5.5rem]"
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
          </div>
        )}
      </div>
    </nav>
  );
}
