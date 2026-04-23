import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '../../core/auth/AuthProvider';
import { initAnalytics, sendPageView } from '../../core/services/analyticsService';
import { initAnalyticsSession } from '../../lib/analytics';

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
import BookingManageRedirect from '../pages/BookingManageRedirect';
import ReservationLookup from '../pages/ReservationLookup';

function PageViewTracker() {
  const location = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    initAnalytics();
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
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/booking/manage" element={<BookingManageRedirect />} />
          <Route path="/reservation-lookup" element={<ReservationLookup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:conversationId" element={<ChatDetail />} />
          <Route path="/checkout/:propertyId" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}
