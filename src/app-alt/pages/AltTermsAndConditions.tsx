import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

const sections: { id: string; title: string; content: ReactNode }[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>
          By accessing VenueSpace (demo), you agree to these terms. If you do not agree, please discontinue use of the site.
        </p>
        <p>
          Content is provided for illustration. Availability, pricing, and policies on live listings may differ.
        </p>
      </div>
    ),
  },
  {
    id: 'services',
    title: 'Nature of the service',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>
          VenueSpace is a discovery layer for event venues. We do not guarantee third-party performance, staffing, or permitting.
        </p>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Listings may include approximate capacity and pricing hints.</li>
          <li>Contracts are between you and the venue unless otherwise stated in writing.</li>
          <li>Hold requests in the demo UI are not stored or transmitted.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'bookings',
    title: 'Bookings, deposits, and cancellations',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>
          Real bookings would be governed by each venue&apos;s contract. Deposits, payment schedules, and force-majeure clauses
          should be reviewed with your legal and finance teams.
        </p>
        <p>
          For this demo, no payment processing occurs and no reservation is created.
        </p>
      </div>
    ),
  },
  {
    id: 'conduct',
    title: 'Acceptable use & conduct',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>Users agree not to misuse the platform: no scraping that harms site performance, no unlawful activity, and no harassment of venues or staff.</p>
        <p>We may suspend demo access for behavior that risks security or integrity.</p>
      </div>
    ),
  },
  {
    id: 'liability',
    title: 'Liability',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>
          To the fullest extent permitted by law, VenueSpace (demo) disclaims warranties and limits liability for indirect or
          consequential damages arising from use of the site or reliance on sample content.
        </p>
      </div>
    ),
  },
  {
    id: 'changes',
    title: 'Changes',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>We may update these terms periodically. Continued use after changes constitutes acceptance of the revised terms.</p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <div className="space-y-4 text-charcoal leading-relaxed">
        <p>Questions about these terms (demo):</p>
        <div className="bg-warm-gray-light p-4 rounded-xl space-y-2 text-sm">
          <p className="m-0">
            <strong>Email:</strong> legal@venuespace.example
          </p>
          <p className="m-0">
            <strong>Mail:</strong> 400 Event Row, Austin, TX
          </p>
        </div>
      </div>
    ),
  },
];

export default function AltTermsAndConditions() {
  const [open, setOpen] = useState<Set<string>>(new Set(['acceptance']));

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-6">
            Terms & <span className="font-bold text-gold">conditions</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed">
            Venue rental context, written for the Alt demo. Not legal advice—have counsel review production terms.
          </p>
          <p className="text-sm text-charcoal mt-4">
            Last updated{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} variant="default" className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-warm-gray-light transition-colors"
                >
                  <h2 className="text-xl font-semibold text-navy m-0">{section.title}</h2>
                  {open.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-gold shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gold shrink-0" />
                  )}
                </button>
                {open.has(section.id) && <div className="px-8 pb-6">{section.content}</div>}
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
            <h3 className="text-lg font-semibold text-navy mb-3">Still unsure?</h3>
            <p className="text-charcoal mb-4 m-0">Reach out through the contact page—we&apos;re happy to clarify how the demo works.</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-navy hover:text-gold transition-all duration-200"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
