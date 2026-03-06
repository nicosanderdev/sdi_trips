import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import RentalsCrossAppOnboarding from '../onboarding/RentalsCrossAppOnboarding';

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className={`pt-24 ${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
      <RentalsCrossAppOnboarding />
    </div>
  );
};

export default Layout;
