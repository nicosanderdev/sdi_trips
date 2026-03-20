import React from 'react';
import { Link } from 'react-router-dom';

const AltNotFound: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4">
    <h1 className="text-xl font-semibold">Not found</h1>
    <Link to="/" className="text-sky-400 underline">
      Back home
    </Link>
  </div>
);

export default AltNotFound;
