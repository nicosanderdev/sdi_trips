import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../ui';
import { isSearchPageEnabled } from '../../../core/config/searchPageVisibility';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

export interface ProcessStep {
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  steps: ProcessStep[];
  ctaLabel: string;
  ctaFallbackLabel: string;
}

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  eyebrow,
  title,
  subtitle,
  steps,
  ctaLabel,
  ctaFallbackLabel,
}) => {
  const revealRef = useRevealOnScroll<HTMLElement>();

  return (
    <section
      id="how-it-works"
      ref={revealRef}
      className="landing-reveal py-20 md:py-28 bg-navy text-white scroll-mt-28"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-2xl mb-12 md:mb-16">
          {eyebrow ? (
            <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-gold/90">
              <span className="inline-block h-px w-8 bg-gold" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h2 className="m-0 mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="m-0 mt-3 text-white/75 text-base md:text-lg leading-relaxed max-w-[42ch]">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/*
          Single list: vertical below lg, horizontal grid at lg+.
          Connecting line drawn with pseudo-elements / absolute overlays.
        */}
        <ol className="relative list-none m-0 p-0 pl-10 space-y-8 lg:pl-0 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
          <div
            className="absolute left-[1.05rem] top-3 bottom-3 w-px bg-white/20 lg:left-[calc(12.5%+0.5rem)] lg:right-[calc(12.5%+0.5rem)] lg:top-[1.35rem] lg:bottom-auto lg:w-auto lg:h-px"
            aria-hidden
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative lg:flex lg:flex-col lg:items-start">
              <span className="absolute -left-10 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-gold bg-navy text-gold text-base font-light tabular-nums lg:static lg:z-10 lg:h-11 lg:w-11 lg:text-xl">
                {index + 1}
              </span>
              <h3 className="m-0 text-lg font-semibold text-white lg:mt-6">{step.title}</h3>
              <p className="m-0 mt-1.5 text-sm text-white/75 leading-relaxed lg:mt-2">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 md:mt-16">
          {isSearchPageEnabled ? (
            <Link to="/search">
              <Button variant="primary" size="lg">
                {ctaLabel}
              </Button>
            </Link>
          ) : (
            <Link to="/reservation-lookup">
              <Button variant="primary" size="lg">
                {ctaFallbackLabel}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
