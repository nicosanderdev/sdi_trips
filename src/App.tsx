import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { initAnalyticsSession } from './lib/analytics';

// Pages (MVP: Home, Terms, Privacy, Search, Property detail; rest show NotFound)
import Landing from './pages/Landing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import NotFound from './pages/NotFound';

function App() {
  useEffect(() => {
    initAnalyticsSession();
  }, []);

  return (
    <AuthProvider>
      <Router>
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
