import React from 'react';

type HeroTitleSectionProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  backgroundImageUrl?: string;
  minHeightClassName?: string;
};

const DEFAULT_HERO_BACKGROUND =
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1800&q=80';

const HeroTitleSection: React.FC<HeroTitleSectionProps> = ({
  children,
  className = '',
  contentClassName = '',
  backgroundImageUrl = DEFAULT_HERO_BACKGROUND,
  minHeightClassName = 'min-h-[320px] md:min-h-[360px]',
}) => {
  return (
    <section className={`group relative isolate overflow-hidden bg-navy ${minHeightClassName} ${className}`}>
      <div
        className="absolute inset-0 bg-cover bg-center scale-100 animate-[heroBgEntryZoom_1400ms_ease-out_forwards] transition-transform duration-700 will-change-transform group-hover:scale-110"
        style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,26,47,0.85)_0%,rgba(10,26,47,0.74)_45%,rgba(10,26,47,0.56)_100%)]"
        aria-hidden="true"
      />
      <div className={`relative z-10 h-full ${contentClassName}`}>{children}</div>
    </section>
  );
};

export default HeroTitleSection;
