import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AltLayout } from '../components/layout/AltLayout';
import AltContact from '../pages/AltContact';
import AltLanding from '../pages/AltLanding';
import AltNotFound from '../pages/AltNotFound';
import AltReservations from '../pages/AltReservations';
import AltSearchProperties from '../pages/AltSearchProperties';
import AltTermsAndConditions from '../pages/AltTermsAndConditions';

export function AppAltRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<AltLayout />}>
          <Route path="/" element={<AltLanding />} />
          <Route path="/search" element={<AltSearchProperties />} />
          <Route path="/contact" element={<AltContact />} />
          <Route path="/reservations" element={<AltReservations />} />
          <Route path="/terms-and-conditions" element={<AltTermsAndConditions />} />
          <Route path="*" element={<AltNotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
