import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function AltFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { labelKey: 'alt.footer.browseVenues' as const, path: '/search' },
    { labelKey: 'alt.footer.howItWorks' as const, path: '/#how-it-works' },
  ];

  const supportLinks = [{ labelKey: 'alt.footer.contactLink' as const, path: '/contact' }];

  const legalLinks = [{ labelKey: 'alt.footer.termsLink' as const, path: '/terms-and-conditions' }];

  const socialLinks = [
    { icon: Facebook, labelKey: 'alt.footer.facebook' as const, href: '#' },
    { icon: Twitter, labelKey: 'alt.footer.twitter' as const, href: '#' },
    { icon: Instagram, labelKey: 'alt.footer.instagram' as const, href: '#' },
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
          {t('alt.footer.welcomeMessage')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="mb-4 inline-block hover:opacity-90 transition-opacity">
              <img
                src="/logo-en-cartelera-alt.png"
                alt="En cartelera - Eventos"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-warm-gray-light mb-6 max-w-md">{t('alt.footer.tagline')}</p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold shrink-0" aria-hidden />
                <span className="text-sm">{t('alt.footer.email')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold shrink-0" aria-hidden />
                <span className="text-sm">{t('alt.footer.phone')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gold shrink-0" aria-hidden />
                <span className="text-sm">{t('alt.footer.address')}</span>
              </div>
            </div>
          </div>

          {linkColumn('alt.footer.exploreHeading', exploreLinks)}
          {linkColumn('alt.footer.supportHeading', supportLinks)}
          {linkColumn('alt.footer.legalHeading', legalLinks)}
        </div>

        <div className="border-t border-white/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-warm-gray-light text-sm m-0">{t('alt.footer.copyright', { year: currentYear })}</p>
              <p className="text-warm-gray-light/80 text-xs mt-1 m-0">{t('alt.footer.madeWithCare')}</p>
            </div>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.labelKey}
                  href={social.href}
                  aria-label={t(social.labelKey)}
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
