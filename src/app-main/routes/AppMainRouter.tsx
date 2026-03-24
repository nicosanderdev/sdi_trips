import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../../core/auth/AuthProvider';
import { initAnalytics, sendPageView } from '../../core/services/analyticsService';

import GuestRoute from '../../components/common/GuestRoute';

import Landing from '../pages/Landing';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import Wishlist from '../pages/Wishlist';
import Inbox from '../pages/Inbox';
import ChatDetail from '../pages/ChatDetail';
import Checkout from '../pages/Checkout';
import Search from '../pages/Search';
import PropertyDetail from '../pages/PropertyDetail';
import NotFound from '../pages/NotFound';

function App() {
  useEffect(() => {
    initAnalyticsSession();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    sendPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

export function AppMainRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/booking/manage" element={<BookingManage />} />
          <Route path="/reservation-lookup" element={<ReservationLookup />} />
          <Route path="/about" element={<NotFound />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<NotFound />} />
          <Route path="/register" element={<NotFound />} />
          <Route path="/forgot-password" element={<NotFound />} />
          <Route path="/profile" element={<NotFound />} />
          <Route path="/wishlist" element={<NotFound />} />
          <Route path="/inbox" element={<NotFound />} />
          <Route path="/inbox/:conversationId" element={<NotFound />} />
          <Route path="/checkout/:propertyId" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}
