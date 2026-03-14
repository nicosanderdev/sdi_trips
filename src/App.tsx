import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initAnalytics, sendPageView } from './lib/analytics';

// Components
import GuestRoute from './components/common/GuestRoute';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Inbox from './pages/Inbox';
import ChatDetail from './pages/ChatDetail';
import Checkout from './pages/Checkout';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import NotFound from './pages/NotFound';

function RouteTracker() {
  const location = useLocation();
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // First page_view is sent from analytics when gtag.js script loads; only send on route changes here
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    sendPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteTracker />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:conversationId" element={<ChatDetail />} />
          <Route path="/checkout/:propertyId" element={<Checkout />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
