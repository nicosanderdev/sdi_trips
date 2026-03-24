import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { Button, Card } from '../../components/ui';
import {
  MapPin,
  Users,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { getVenueById } from '../data/staticVenues';

export default function AltVenueDetail() {
  const { id } = useParams<{ id: string }>();
  const venue = id ? getVenueById(id) : undefined;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryOpacity, setGalleryOpacity] = useState(1);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const heroImages = venue?.images ?? [];
  const heroImageCount = heroImages.length;
  const displayImageIndex = heroImageCount > 0 ? currentImageIndex % heroImageCount : 0;

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  const transitionThenSetIndex = (nextIndex: number) => {
    setGalleryOpacity(0);
    window.setTimeout(() => {
      setCurrentImageIndex(nextIndex);
      setGalleryOpacity(1);
    }, 200);
  };

  if (!venue) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-8 py-20 bg-warm-gray">
        <h1 className="text-2xl font-bold text-navy mb-4">Venue not found</h1>
        <p className="text-charcoal mb-6 text-center max-w-md">This listing may have moved. Browse all venues to keep exploring.</p>
        <Link to="/search">
          <Button variant="primary">Back to venues</Button>
        </Link>
      </div>
    );
  }

  const attributeBlocks = [
    {
      title: 'Capacity & layout',
      description: `Up to ${venue.capacity} guests. ${venue.layoutNotes}`,
      icon: <Users className="h-6 w-6 text-gold" />,
    },
    {
      title: 'Event types',
      description: venue.eventTypes.join(' · '),
      icon: <Sparkles className="h-6 w-6 text-gold" />,
    },
    {
      title: 'Pricing hint',
      description: `${venue.priceHint}. Final quotes depend on date, staffing, and add-ons.`,
      icon: <CalendarDays className="h-6 w-6 text-gold" />,
    },
  ];

  return (
    <div className="bg-warm-gray min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-charcoal">
          <Link to="/search" className="flex items-center gap-2 text-charcoal hover:text-navy transition-colors w-fit">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to venues</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-charcoal/80">
            <MapPin className="h-4 w-4 text-gold" />
            <span>{venue.location}</span>
          </div>
        </div>

        <section className="space-y-6">
          <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-[0_25px_60px_-25px_rgba(43,43,43,0.35)] aspect-[4/3]">
            <img
              key={displayImageIndex}
              src={heroImages[displayImageIndex]}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-in-out"
              style={{ opacity: galleryOpacity }}
            />
            {heroImageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    transitionThenSetIndex((displayImageIndex - 1 + heroImageCount) % heroImageCount)
                  }
                  className="absolute top-1/2 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5 text-navy" />
                </button>
                <button
                  type="button"
                  onClick={() => transitionThenSetIndex((displayImageIndex + 1) % heroImageCount)}
                  className="absolute top-1/2 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5 text-navy" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-navy shadow-md">
              {displayImageIndex + 1} / {heroImageCount}
            </div>
          </div>

          {heroImageCount > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {heroImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => index !== displayImageIndex && transitionThenSetIndex(index)}
                  className={`flex h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                    index === displayImageIndex ? 'border-gold' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-charcoal/80">
                <MapPin className="h-4 w-4 text-gold" />
                <span>{venue.location}</span>
                <span aria-hidden>•</span>
                <span className="text-venue-accent font-medium">VenueSpace curated</span>
              </div>
              <h1 className="text-4xl font-thin leading-tight text-navy">{venue.name}</h1>
              <p className="max-w-3xl text-lg text-charcoal">{venue.subtitle}</p>
              <p className="text-charcoal/90 leading-relaxed">{venue.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-charcoal">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>Up to {venue.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-venue-accent" />
                  <span>{venue.eventTypes.length} event categories</span>
                </div>
              </div>

              <section className="space-y-4 pt-4">
                <h2 className="text-2xl font-semibold text-navy">Why this space works</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {attributeBlocks.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-3xl border border-warm-gray bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-gray-light">{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                        <p className="text-sm text-charcoal/80">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-navy">Amenities</h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {venue.amenities.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 rounded-2xl border border-warm-gray bg-white/80 px-3 py-2 text-sm text-charcoal"
                      >
                        <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-navy">Policies & logistics</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {venue.policies.map((p) => (
                      <div key={p.title} className="rounded-2xl border border-navy/10 bg-white p-4">
                        <p className="text-sm font-semibold text-navy">{p.title}</p>
                        <p className="text-sm text-charcoal/85 mt-2 m-0">{p.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <Card className="space-y-4 rounded-[2rem] border border-warm-gray bg-white/80 p-6 shadow-[0_20px_40px_-20px_rgba(43,43,43,0.35)]">
                <div className="flex items-center gap-4">
                  <img
                    src="https://ui-avatars.com/api/?name=Venue+Coordinator&background=F3E9DD&color=2B2B2B"
                    alt=""
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-charcoal/70">Venue team</p>
                    <h3 className="text-xl font-semibold text-navy">Alex & Jordan</h3>
                    <p className="text-sm text-charcoal">Coordinators for this listing (demo)</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-charcoal">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gold" />
                    <span>Site visit windows available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gold" />
                    <span>Preferred vendor list on request</span>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 rounded-full border border-warm-gray px-4 py-2 text-sm font-medium text-navy hover:border-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-venue-accent" />
                  Message the venue
                </Link>
              </Card>

              <Card className="space-y-4 rounded-[2rem] border border-warm-gray bg-white p-6 shadow-[0_20px_45px_-25px_rgba(43,43,43,0.35)]">
                <div className="space-y-1 text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-charcoal/70">Starting from</p>
                  <div className="text-2xl font-semibold text-navy">{venue.priceHint}</div>
                  <p className="text-sm text-charcoal">Taxes, staffing, and rentals may apply.</p>
                </div>
                <Button variant="primary" size="lg" className="w-full" type="button" onClick={() => setShowCalendar((s) => !s)}>
                  Check availability
                </Button>

                {showCalendar && (
                  <div className="pt-4 border-t border-warm-gray space-y-4">
                    <p className="text-xs text-charcoal/80">
                      Select event dates (demo calendar—no backend). This uses the same date picker styling as the main site.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Event start</label>
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => {
                          setCheckIn(date);
                          if (checkOut && date && checkOut < date) setCheckOut(null);
                        }}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={minDate}
                        placeholderText="Select start date"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent"
                        calendarClassName="custom-datepicker"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">Event end</label>
                      <DatePicker
                        selected={checkOut}
                        onChange={(date) => setCheckOut(date)}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn ?? minDate}
                        disabled={!checkIn}
                        placeholderText="Select end date"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        calendarClassName="custom-datepicker"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl"
                      type="button"
                      onClick={() => {
                        /* demo only */
                      }}
                    >
                      Request a hold (demo)
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
