import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import '../i18n/config';
import { setAppVariant } from '../core/config/guestSiteListingType';
import { appConfig } from './config/appConfig';
import { AppMainRouter } from './routes/AppMainRouter';

setAppVariant(appConfig.appId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMainRouter />
  </StrictMode>,
);
