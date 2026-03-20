import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
import { AppMainRouter } from './app-main/routes/AppMainRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMainRouter />
  </StrictMode>,
);
