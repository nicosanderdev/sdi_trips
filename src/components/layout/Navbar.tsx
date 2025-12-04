import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, User, Heart, MessageCircle, Calendar, LogOut } from 'lucide-react';
import { Button } from '../ui';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/terms', label: 'Terms' },
  ];

  const userMenuItems = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/trips', label: 'My Trips', icon: Calendar },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/inbox', label: 'Inbox', icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-full px-6 py-3 shadow-gold border border-gold/20">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="text-navy font-bold text-xl hover:text-gold transition-colors">
            Holiday Trips
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
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search destinations..."
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
                    title={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                ))}
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="p-2 rounded-full text-navy hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between">
          <Link to="/" className="text-navy font-bold text-lg">
            Holiday Trips
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
                  placeholder="Search destinations..."
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
                  {item.label}
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
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
