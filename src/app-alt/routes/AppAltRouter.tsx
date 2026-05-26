import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '../alt-theme.css';
import { AuthProvider } from '../../core/auth/AuthProvider';
import { AltLayout } from '../components/layout/AltLayout';
import AltContact from '../pages/AltContact';
import AltLanding from '../pages/AltLanding';
import AltNotFound from '../pages/AltNotFound';
import AltReservationLookup from '../pages/AltReservationLookup';
import AltSearchProperties from '../pages/AltSearchProperties';
import AltTermsAndConditions from '../pages/AltTermsAndConditions';
import AltVenueDetail from '../pages/AltVenueDetail';
import Register from '../../app-main/pages/Register';
import ForgotPassword from '../../app-main/pages/ForgotPassword';

export function AppAltRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AltLayout />}>
            <Route path="/" element={<AltLanding />} />
            <Route path="/search" element={<AltSearchProperties />} />
            <Route path="/contact" element={<AltContact />} />
            <Route path="/reservation-lookup" element={<AltReservationLookup />} />
            <Route path="/terms-and-conditions" element={<AltTermsAndConditions />} />
            <Route path="/venue/:id" element={<AltVenueDetail />} />
            <Route path="/register" element={<Register variant="alt" />} />
            <Route path="/forgot-password" element={<ForgotPassword variant="alt" />} />
            <Route path="*" element={<AltNotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
