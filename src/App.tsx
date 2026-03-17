import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initAnalytics, sendPageView } from './lib/analytics';

// Pages (MVP: Home, Terms, Privacy, Search, Property detail; rest show NotFound)
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import NotFound from './pages/NotFound';

function RouteTracker() {
  const location = useLocation();
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    console.log('VITE_GA_MEASUREMENT_ID in app:', import.meta.env.VITE_GA_MEASUREMENT_ID);
    initAnalytics();
  }, []);

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
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/about" element={<NotFound />} />
          <Route path="/contact" element={<NotFound />} />
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
    </AuthProvider>
  );
}

export default App;
