import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
import { AppAltRouter } from './app-alt/routes/AppAltRouter';
import { AppMainRouter } from './app-main/routes/AppMainRouter';

function AppRouterByVariant() {
  const mode = import.meta.env.MODE;
  const isAlt = mode === 'alt';

  return isAlt ? <AppAltRouter /> : <AppMainRouter />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouterByVariant />
  </StrictMode>,
);
