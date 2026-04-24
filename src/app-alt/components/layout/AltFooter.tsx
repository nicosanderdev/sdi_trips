import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function AltFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { labelKey: 'alt.footer.termsLink' as const, path: '/terms-and-conditions' },
      { labelKey: 'common.contact' as const, path: '/contact' },
    ],
    explore: [
      { labelKey: 'alt.footer.browseVenues' as const, path: '/search' },
      { labelKey: 'alt.footer.weddingVenues' as const, path: '/search' },
      { labelKey: 'alt.footer.corporateEvents' as const, path: '/search' },
      { labelKey: 'alt.footer.privateParties' as const, path: '/search' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, labelKey: 'alt.footer.facebook' as const, href: '#' },
    { icon: Twitter, labelKey: 'alt.footer.twitter' as const, href: '#' },
    { icon: Instagram, labelKey: 'alt.footer.instagram' as const, href: '#' },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
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

          <div>
            <h3 className="font-semibold text-gold mb-4">{t('alt.footer.companyHeading')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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

          <div>
            <h3 className="font-semibold text-gold mb-4">{t('alt.footer.exploreHeading')}</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.labelKey}>
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
        </div>

        <div className="border-t border-white/15 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-warm-gray-light text-sm">{t('alt.footer.copyright', { year: currentYear })}</p>
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
