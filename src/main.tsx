import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
import { setAppVariant } from './core/config/guestSiteListingType';
import { AppAltRouter } from './app-alt/routes/AppAltRouter';
import { AppMainRouter } from './app-main/routes/AppMainRouter';

const isAlt = import.meta.env.MODE === 'alt';
setAppVariant(isAlt ? 'alt' : 'main');

function AppRouterByVariant() {
  return isAlt ? <AppAltRouter /> : <AppMainRouter />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouterByVariant />
  </StrictMode>,
);
