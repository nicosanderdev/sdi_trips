import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../core/auth/AuthProvider';

import AltHome from '../pages/AltHome';
import AltLogin from '../pages/AltLogin';
import AltProfile from '../pages/AltProfile';
import AltNotFound from '../pages/AltNotFound';

export function AppAltRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AltHome />} />
          <Route path="/login" element={<AltLogin />} />
          <Route path="/profile" element={<AltProfile />} />
          <Route path="*" element={<AltNotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
