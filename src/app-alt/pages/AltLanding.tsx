import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Heart, Briefcase, PartyPopper } from 'lucide-react';
import { listVenues } from '../data/staticVenues';

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1519167758481-83f29da3a0a6?auto=format&fit=crop&w=1400&q=80',
    quote: 'Our wedding felt effortless—the team handled the flip from ceremony to reception in under an hour.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    quote: 'We hosted a product launch for 150 guests. AV, load-in, and security were dialed in from day one.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1520854221050-0f4caff449f5?auto=format&fit=crop&w=1400&q=80',
    quote: 'The ballroom photos at golden hour were unreal. Guests are still talking about the dance floor.',
  },
];

const featureCards = [
  {
    icon: Heart,
    title: 'Weddings',
    description: 'Ceremony and reception spaces with room for your traditions, timeline, and dance floor.',
  },
  {
    icon: Briefcase,
    title: 'Corporate',
    description: 'Summits, offsites, and client dinners with flexible seating and professional AV options.',
  },
  {
    icon: PartyPopper,
    title: 'Parties',
    description: 'Milestones, fundraisers, and celebrations with capacity and layout options to match.',
  },
];

const howSteps = [
  { title: 'Browse venues', description: 'Filter by capacity, event type, and location across curated listings.' },
  { title: 'Compare details', description: 'Review amenities, layouts, and pricing hints before you reach out.' },
  { title: 'Hold your date', description: 'Pick event dates on the calendar and submit a hold request (demo UI).' },
  { title: 'Plan with confidence', description: 'Work with venue coordinators using clear policies and timelines.' },
];

export default function AltLanding() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const venues = listVenues();

  useEffect(() => {
    const id = window.setInterval(() => {
      setFade(true);
      window.setTimeout(() => {
        setSlideIndex((i) => (i + 1) % heroSlides.length);
        setFade(false);
      }, 400);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const current = heroSlides[slideIndex];

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-navy isolate">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-70' : 'opacity-100'}`}
          style={{ backgroundImage: `url("${current.image}")` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(43,43,43,0.88)_0%,rgba(43,43,43,0.72)_45%,rgba(43,43,43,0.5)_100%)]"
          aria-hidden
        />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="m-0 text-white font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] max-w-[16ch]">
              Find the venue your guests will remember
            </h1>
            <p className="mt-4 text-white/95 text-[clamp(1rem,1.8vw,1.25rem)] max-w-[36ch]">
              Weddings, corporate events, and private parties—discover spaces with clear capacity, amenities, and transparent
              pricing hints.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center w-full max-w-[640px] p-3 rounded-2xl border border-gold/35 bg-white/95 backdrop-blur-sm">
              <input
                className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                type="text"
                name="q"
                placeholder="Search by city or venue style"
                aria-label="Search venues"
              />
              <Link to="/search" className="md:justify-self-end w-full md:w-auto">
                <Button type="button" variant="primary" size="md" className="w-full md:w-auto justify-center">
                  Search venues
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                Curated listings
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                Capacity & layout notes
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                Date hold demo
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search">
                <Button variant="primary" size="lg">
                  Explore venues
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-navy hover:border-gold hover:text-gold">
                  Talk to us
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[400px] rounded-3xl overflow-hidden border border-gold/25 shadow-2xl bg-white/10 backdrop-blur-sm">
            <div
              className={`absolute inset-0 p-8 flex flex-col justify-end bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-80' : 'opacity-100'}`}
              style={{ backgroundImage: `url("${current.image}")` }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/20" />
              <h3 className="relative z-10 m-0 text-lg font-bold text-white">Planner & host stories</h3>
              <p className="relative z-10 mt-2 text-white/90 text-sm leading-relaxed">{current.quote}</p>
            </div>
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${index === slideIndex ? 'bg-gold scale-125' : 'bg-white/50'}`}
                  aria-label={`Show story ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">Every occasion</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">Built for your event type</h2>
            <p className="mt-3 text-charcoal/80 max-w-2xl mx-auto">
              Same rigor as a hospitality platform—applied to venues you can actually book.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-navy/10 bg-warm-gray p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full grid place-items-center bg-white text-venue-accent border border-navy/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-navy">{title}</h3>
                <p className="m-0 mt-2 text-sm text-charcoal/85 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">Featured</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">Popular venues this season</h2>
            <p className="mt-3 text-charcoal/80 max-w-3xl mx-auto">Hand-picked spaces with strong lighting, flow, and guest experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {venues.slice(0, 6).map((venue, index) => {
              const image = venue.images[0];
              return (
                <article key={venue.id} className="relative min-h-[220px] border border-navy/15 rounded-2xl overflow-hidden bg-navy group">
                  <Link to={`/venue/${venue.id}`} className="absolute inset-0 z-10" aria-label={venue.name} />
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url("${image}")` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/35" />
                  <div className="absolute left-4 right-4 bottom-4 z-20 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-white text-lg font-semibold">{venue.name}</h3>
                      <p className="m-0 mt-1 text-white/85 text-sm">{venue.location}</p>
                      <p className="m-0 mt-1 text-white/75 text-xs">Up to {venue.capacity} guests · {venue.priceHint}</p>
                    </div>
                    {index === 0 && (
                      <span className="rounded-full px-3 py-1 text-xs font-bold bg-gold text-navy whitespace-nowrap">Popular</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/search">
              <Button variant="outline" size="lg">
                Find your perfect venue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">How it works</h2>
            <p className="mt-3 text-charcoal/80 max-w-2xl mx-auto">A simple path from discovery to a confident hold request.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howSteps.map((step, i) => (
              <article key={step.title} className="rounded-2xl border border-navy/10 bg-warm-gray p-5">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-white text-navy border border-navy/15 font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-4 mb-2 text-lg font-semibold text-navy">{step.title}</h3>
                <p className="m-0 text-sm text-charcoal/85">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-thin mb-4">
            Ready to <span className="font-bold text-gold">shortlist</span> your venue?
          </h2>
          <p className="text-lg text-white/85 mb-8 leading-relaxed">
            Browse the full catalog, compare capacity, and open any listing to try the date picker (demo).
          </p>
          <Link to="/search">
            <Button variant="primary" size="lg">
              Start browsing
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
