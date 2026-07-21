import React from 'react';
import { useTranslation } from 'react-i18next';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import MercadoPagoPaymentReturn from '../../components/reservation/MercadoPagoPaymentReturn';

export default function AltMercadoPagoPaymentResultPage() {
  const { t } = useTranslation();

  return (
    <>
      <HeroTitleSection
        className="py-20 md:py-24"
        contentClassName="mx-auto max-w-4xl px-6 text-center flex flex-col items-center justify-center"
      >
        <h1 className="text-4xl md:text-5xl font-thin text-white mb-4">
          {t('mercadoPago.return.pageLabel')}
        </h1>
      </HeroTitleSection>
      <div className="px-6 py-12 md:py-16">
        <MercadoPagoPaymentReturn cardVariant="surface" className="mx-auto max-w-4xl" />
      </div>
    </>
  );
}
