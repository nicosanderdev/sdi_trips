import React from 'react';
import { useTranslation } from 'react-i18next';

type TestimonialsVariant = 'main' | 'alt';

interface TestimonialsProps {
  variant?: TestimonialsVariant;
}

const Testimonials: React.FC<TestimonialsProps> = ({ variant = 'main' }) => {
  const { t } = useTranslation();
  const prefix = variant === 'alt' ? 'alt.landing.testimonials' : 'landing.testimonials';

  const testimonials = [1, 2, 3].map((id) => ({
    id,
    text: t(`${prefix}.items.${id}.text`),
    author: t(`${prefix}.items.${id}.author`),
    location: t(`${prefix}.items.${id}.location`),
  }));

  return (
    <section className="py-24 bg-warm-gray-light">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="m-0 text-3xl md:text-4xl font-bold text-navy">
            {t(`${prefix}.title`)}
          </h2>
          <p className="mt-3 m-0 text-charcoal/80 max-w-xl mx-auto">
            {t(`${prefix}.subtitle`)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="m-0 rounded-3xl border border-navy/10 bg-white p-6 text-charcoal leading-relaxed"
            >
              <p className="m-0 italic">&ldquo;{testimonial.text}&rdquo;</p>
              <footer className="mt-4 text-sm text-navy/70 not-italic">
                — {testimonial.author}, {testimonial.location}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
