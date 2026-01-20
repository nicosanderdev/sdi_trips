import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User, Heart, MessageCircle, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isLoggedIn = !!user;
  const location = useLocation();
  const { t, i18n: i18nInstance } = useTranslation();

  const navItems = [
    { path: '/', labelKey: 'nav.home' },
    { path: '/about', labelKey: 'nav.about' },
    { path: '/terms', labelKey: 'nav.terms' },
  ];

  const userMenuItems = [
    { path: '/profile', labelKey: 'nav.profile', icon: User },
    { path: '/wishlist', labelKey: 'nav.wishlist', icon: Heart },
    { path: '/inbox', labelKey: 'nav.inbox', icon: MessageCircle },
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t('nav.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white/50"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-navy text-gold'
                        : 'text-navy hover:bg-gold hover:text-navy'
                    }`}
                    title={t(item.labelKey)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-navy hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  title={t('nav.logout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    {t('nav.signUp')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Language Switcher */}
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
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
              </div>
            </div>

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

            {/* Mobile User Actions */}
            {isLoggedIn ? (
              <div className="space-y-2">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-navy text-gold'
                        : 'text-navy hover:bg-gold hover:text-navy'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('nav.signIn')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    {t('nav.signUp')}
                  </Button>
                </Link>
              </div>
            )}

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
