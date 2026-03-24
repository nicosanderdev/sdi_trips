import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppAltRouter } from './routes/AppAltRouter';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppAltRouter />
  </StrictMode>,
);
