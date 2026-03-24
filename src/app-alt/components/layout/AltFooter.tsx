import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function AltFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'Terms & conditions', path: '/terms-and-conditions' },
      { label: 'Contact', path: '/contact' },
    ],
    explore: [
      { label: 'Browse venues', path: '/search' },
      { label: 'Wedding venues', path: '/search' },
      { label: 'Corporate events', path: '/search' },
      { label: 'Private parties', path: '/search' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold text-gold mb-4 block">
              VenueSpace
            </Link>
            <p className="text-warm-gray-light mb-6 max-w-md">
              Find and book exceptional event venues for weddings, corporate gatherings, and celebrations. Curated spaces with transparent capacity and pricing hints.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm">hello@venuespace.example</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm">+1 (555) 010-2030</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm">Austin, TX</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-warm-gray-light hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gold mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-warm-gray-light hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-warm-gray-light text-sm">
              © {currentYear} VenueSpace. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-warm-gray-light hover:text-gold transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
