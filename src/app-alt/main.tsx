import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import '../i18n/config';
import './alt-theme.css';
import { setAppVariant } from '../core/config/guestSiteListingType';
import { appConfig } from './config/appConfig';
import { AppAltRouter } from './routes/AppAltRouter';

setAppVariant(appConfig.appId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppAltRouter />
  </StrictMode>,
);
