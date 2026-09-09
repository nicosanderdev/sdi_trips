import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

type HumanTouchVariant = 'main' | 'alt';

interface HumanTouchSectionProps {
  variant?: HumanTouchVariant;
}

const HumanTouchSection: React.FC<HumanTouchSectionProps> = ({ variant = 'main' }) => {
  const { t } = useTranslation();
  const prefix = variant === 'alt' ? 'alt.landing.humanTouch' : 'landing.humanTouch';

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="rounded-3xl bg-warm-gray border border-navy/10 p-8 md:p-12 max-w-3xl mx-auto text-center">
          <h2 className="m-0 text-2xl md:text-3xl font-bold text-navy">{t(`${prefix}.title`)}</h2>
          <div className="mt-6 space-y-4 text-charcoal/85 text-base leading-relaxed">
            <p className="m-0">{t(`${prefix}.paragraph1`)}</p>
            <p className="m-0">{t(`${prefix}.paragraph2`)}</p>
            <p className="m-0">{t(`${prefix}.paragraph3`)}</p>
          </div>
          <div className="mt-8">
            <Link to="/about">
              <Button variant="primary" size="lg">
                {t(`${prefix}.learnMore`)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanTouchSection;
