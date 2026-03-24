import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Calendar, MapPin } from 'lucide-react';

type ReservationStatus = 'upcoming' | 'past' | 'cancelled';

const rows: {
  id: string;
  venue: string;
  location: string;
  date: string;
  guests: number;
  status: ReservationStatus;
}[] = [
  {
    id: '1',
    venue: 'The Grand Elm Ballroom',
    location: 'Downtown, Austin',
    date: 'June 14, 2025',
    guests: 180,
    status: 'upcoming',
  },
  {
    id: '2',
    venue: 'Foundry Hall',
    location: 'East Austin',
    date: 'March 3, 2025',
    guests: 90,
    status: 'past',
  },
  {
    id: '3',
    venue: 'Skyline Rooftop 12',
    location: 'Central Austin',
    date: 'May 22, 2025',
    guests: 65,
    status: 'upcoming',
  },
  {
    id: '4',
    venue: 'Studio 9 Loft',
    location: 'South Congress',
    date: 'Jan 18, 2025',
    guests: 40,
    status: 'cancelled',
  },
];

function StatusPill({ status }: { status: ReservationStatus }) {
  const map = {
    upcoming: 'bg-venue-accent/15 text-venue-accent border-venue-accent/30',
    past: 'bg-navy/10 text-navy border-navy/15',
    cancelled: 'bg-gold/15 text-gold border-gold/30',
  } as const;
  const label = status === 'upcoming' ? 'Upcoming' : status === 'past' ? 'Past' : 'Cancelled';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${map[status]}`}>{label}</span>
  );
}

export default function AltReservations() {
  return (
    <>
      <section className="py-20 bg-linear-to-br from-warm-gray-light to-white border-b border-navy/10">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-4">
            Your <span className="font-bold text-gold">reservations</span>
          </h1>
          <p className="text-lg text-charcoal/90 max-w-2xl mx-auto">
            Demo view of holds and bookings. Status chips help you scan what is upcoming, completed, or cancelled.
          </p>
        </div>
      </section>

      <section className="py-16 bg-warm-gray">
        <div className="max-w-5xl mx-auto px-8">
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-navy/10 bg-warm-gray/50 text-navy">
                  <th className="px-6 py-4 font-semibold">Venue</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Guests</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-navy/5 last:border-0 hover:bg-warm-gray/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-navy">{r.venue}</div>
                      <div className="flex items-center gap-1 text-charcoal/70 text-xs mt-1">
                        <MapPin className="h-3.5 w-3.5 text-venue-accent" />
                        {r.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gold" />
                        {r.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal">{r.guests}</td>
                    <td className="px-6 py-4">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to="/search" className="text-sm font-medium text-venue-accent hover:underline">
                        View venues
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {rows.map((r) => (
              <article key={r.id} className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-navy m-0">{r.venue}</h2>
                    <p className="text-xs text-charcoal/70 flex items-center gap-1 mt-1 m-0">
                      <MapPin className="h-3.5 w-3.5 text-venue-accent" />
                      {r.location}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <Calendar className="h-4 w-4 text-gold" />
                  {r.date}
                </div>
                <p className="text-sm text-charcoal m-0">
                  <span className="font-medium text-navy">{r.guests}</span> guests
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-charcoal/80 mb-4">Need another date or venue?</p>
            <Link to="/search">
              <Button variant="primary" size="lg">
                Browse venues
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
