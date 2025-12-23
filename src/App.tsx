import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Terms from './pages/Terms';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Trips from './pages/Trips';
import Wishlist from './pages/Wishlist';
import Inbox from './pages/Inbox';
import ChatDetail from './pages/ChatDetail';
import Checkout from './pages/Checkout';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/inbox/:conversationId" element={<ChatDetail />} />
          <Route path="/checkout/:propertyId" element={<Checkout />} />
          <Route path="/search" element={<Search />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
