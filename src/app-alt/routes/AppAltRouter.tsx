import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import '../alt-theme.css';
import { AuthProvider } from '../../core/auth/AuthProvider';
import ComingSoon from '../../components/pages/ComingSoon';
import { AltLayout } from '../components/layout/AltLayout';
import { appConfig } from '../config/appConfig';
import AltContact from '../pages/AltContact';
import AltLanding from '../pages/AltLanding';
import AltNotFound from '../pages/AltNotFound';
import AltReservationLookup from '../pages/AltReservationLookup';
import AltMercadoPagoPaymentResultPage from '../pages/AltMercadoPagoPaymentResultPage';
import AltSearchProperties from '../pages/AltSearchProperties';
import AltTermsAndConditions from '../pages/AltTermsAndConditions';
import AltVenueDetail from '../pages/AltVenueDetail';
import ForgotPassword from '../../app-main/pages/ForgotPassword';
import About from '../../app-main/pages/About';

export function AppAltRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {appConfig.featureFlags.comingSoon ? (
            <>
              <Route path="/" element={<ComingSoon variant="alt" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <Route element={<AltLayout />}>
              <Route path="/" element={<AltLanding />} />
              <Route path="/search" element={<AltSearchProperties />} />
              <Route path="/contact" element={<AltContact />} />
              <Route path="/about" element={<About variant="alt" />} />
              <Route path="/reservation-lookup" element={<AltReservationLookup />} />
              <Route path="/pago-mercado-pago/resultado" element={<AltMercadoPagoPaymentResultPage />} />
              <Route path="/terms-and-conditions" element={<AltTermsAndConditions />} />
              <Route path="/venue/:id" element={<AltVenueDetail />} />
              <Route path="/forgot-password" element={<ForgotPassword variant="alt" />} />
              <Route path="*" element={<AltNotFound />} />
            </Route>
          )}
        </Routes>
      </Router>
    </AuthProvider>
  );
}
