import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import '../i18n/config';
import { AppAltRouter } from './routes/AppAltRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppAltRouter />
  </StrictMode>,
);
