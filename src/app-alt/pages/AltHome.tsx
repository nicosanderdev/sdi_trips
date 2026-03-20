import React from 'react';
import { Link } from 'react-router-dom';
import { appConfig } from '../config/appConfig';

const AltHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Alt app ({appConfig.appId})</h1>
      <p className="text-slate-400 text-center max-w-md">
        Minimal shell. Use the same core auth and services as the main app; routing and pages are independent.
      </p>
      <div className="flex gap-4">
        <Link className="underline text-sky-400 hover:text-sky-300" to="/login">
          Login
        </Link>
        <Link className="underline text-sky-400 hover:text-sky-300" to="/profile">
          Profile
        </Link>
      </div>
    </div>
  );
};

export default AltHome;
