import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthProvider';

const AltProfile: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Profile (alt)</h1>
      <p className="text-slate-400">{user.email}</p>
      <div className="flex gap-4">
        <Link className="text-sky-400 underline" to="/">
          Home
        </Link>
        <button
          type="button"
          className="text-sky-400 underline"
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default AltProfile;
