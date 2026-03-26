import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AltFooter } from './AltFooter';
import { AltNavbar } from './AltNavbar';

export function AltLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('alt.layout.documentTitle');
  }, [t]);

  return (
    <div className="alt-site min-h-screen bg-warm-gray">
      <AltNavbar />
      <main className="pt-24">
        <Outlet />
      </main>
      <AltFooter />
    </div>
  );
}
