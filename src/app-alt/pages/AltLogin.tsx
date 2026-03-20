import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthProvider';

/**
 * Minimal login for app-alt (no shared pages with app-main).
 */
const AltLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-6"
      >
        <h1 className="text-xl font-semibold">Sign in (alt)</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <label className="block text-sm">
          <span className="text-slate-400">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Password</span>
          <input
            type="password"
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-sky-600 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {loading ? '…' : 'Login'}
        </button>
        <p className="text-center text-sm text-slate-400">
          <Link to="/" className="text-sky-400 hover:underline">
            Home
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AltLogin;
