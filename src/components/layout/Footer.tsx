import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const contact = t('footer.contact', {
    returnObjects: true,
    defaultValue: {
      email: 'admin@encartelera.uy',
      phone: '+598 99 205 886',
      address: 'Rivera, Uruguay',
    },
  }) as { email: string; phone: string; address: string };

  const exploreLinks = [
    { labelKey: 'footer.vacationHomes', path: '/search' },
    { labelKey: 'footer.popularAreas', path: '/search?q=Rivera' },
    { labelKey: 'footer.howItWorks', path: '/#how-it-works' },
  ];

  const supportLinks = [{ labelKey: 'nav.contact', path: '/contact' }];

  const legalLinks = [
    { labelKey: 'footer.privacyPolicy', path: '/privacy' },
    { labelKey: 'footer.termsOfService', path: '/terms' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const linkColumn = (headingKey: string, links: { labelKey: string; path: string }[]) => (
    <div>
      <h3 className="font-semibold text-gold mb-4">{t(headingKey)}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.path + link.labelKey}>
            <Link
              to={link.path}
              className="text-warm-gray-light hover:text-gold transition-colors text-sm"
            >
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <p className="text-warm-gray-light text-center text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('footer.welcomeMessage')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-block hover:opacity-90 transition-opacity">
              <img
                src="/logo-en-cartelera.png"
                alt="Summer rentals: En cartelera - Escapadas"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-warm-gray-light mb-6 max-w-md">{t('footer.brandDescription')}</p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold" />
                <span className="text-sm">{contact.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-sm">{contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold" />
                <span className="text-sm">{contact.address}</span>
              </div>
            </div>
          </div>

          {linkColumn('footer.exploreHeading', exploreLinks)}
          {linkColumn('footer.supportHeading', supportLinks)}
          {linkColumn('footer.legalHeading', legalLinks)}
        </div>

        <div className="border-t border-warm-gray/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-warm-gray-light text-sm m-0">
                © {currentYear} {t('nav.logo')}. {t('footer.allRightsReserved')}
              </p>
              <p className="text-warm-gray-light/80 text-xs mt-1 m-0">{t('footer.madeWithCare')}</p>
            </div>

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
};

export default Footer;
