import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/search', label: 'Venues' },
  { path: '/reservations', label: 'Reservations' },
  { path: '/contact', label: 'Contact' },
  { path: '/terms-and-conditions', label: 'Terms' },
];

export function AltNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/search') return location.pathname === '/search' || location.pathname.startsWith('/venue/');
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl" aria-label="Main navigation">
      <div className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-3 shadow-gold border border-gold/20">
        <div className="hidden md:flex items-center justify-between gap-6">
          <Link to="/" className="text-navy font-bold text-xl hover:text-gold transition-colors shrink-0">
            Venue<span className="text-venue-accent">Space</span>
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
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between gap-2">
          <Link to="/" className="text-navy font-bold text-lg">
            Venue<span className="text-venue-accent">Space</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full text-navy hover:bg-gold hover:text-navy transition-all duration-200"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
