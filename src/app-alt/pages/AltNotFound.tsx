import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Home } from 'lucide-react';

export default function AltNotFound() {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-8 py-24 bg-linear-to-b from-warm-gray to-white">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-venue-accent mb-4">404</p>
      <h1 className="text-4xl md:text-5xl font-thin text-navy text-center mb-4">
        This page isn&apos;t on the <span className="font-bold text-gold">guest list</span>
      </h1>
      <p className="text-lg text-charcoal/90 text-center max-w-lg mb-10 leading-relaxed">
        The link may be outdated, or the venue page moved. Head home to keep browsing beautiful event spaces.
      </p>
      <Link to="/">
        <Button variant="primary" size="lg" className="gap-2">
          <Home className="h-5 w-5" />
          Back to homepage
        </Button>
      </Link>
    </section>
  );
}
