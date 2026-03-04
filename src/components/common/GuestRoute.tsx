import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { getMemberProfile } from '../../services/memberService';

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [checkingMember, setCheckingMember] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setRedirectPath(null);
        return;
      }

      try {
        setCheckingMember(true);
        const member = await getMemberProfile(user.id);
        if (member && member.needsOnboarding) {
          setRedirectPath('/profile');
        } else {
          setRedirectPath('/search');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setRedirectPath('/search');
      } finally {
        setCheckingMember(false);
      }
    };

    checkOnboarding();
  }, [user]);

  // Show loading spinner while checking authentication status
  if (loading || (user && checkingMember) || (user && !redirectPath)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user) {
    return <Navigate to={redirectPath || '/search'} replace />;
  }

  // Render the requested page for non-authenticated users
  return <>{children}</>;
};

export default GuestRoute;
