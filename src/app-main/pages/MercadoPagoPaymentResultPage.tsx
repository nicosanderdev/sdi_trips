import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import MercadoPagoReturnNotice from '../../components/reservation/MercadoPagoReturnNotice';
import {
  buildLegacyListingRedirect,
  hasMercadoPagoReturnSignal,
  resolveMercadoPagoReturnOutcome,
} from '../../utils/mercadoPagoReturn';

const MercadoPagoPaymentResultPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = buildLegacyListingRedirect(searchParams, '/property');
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  const bookingId = searchParams.get('bookingId')?.trim() ?? '';
  const hasSignal = hasMercadoPagoReturnSignal(searchParams);

  return (
    <Layout>
      <div className="bg-cream min-h-[60vh] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="sr-only">{t('mercadoPago.return.pageLabel')}</p>
          <MercadoPagoReturnNotice
            bookingId={bookingId}
            outcome={hasSignal ? resolveMercadoPagoReturnOutcome(searchParams) : 'unknown'}
            trustUrlStatus
            alwaysShowLookup
          />
        </div>
      </div>
    </Layout>
  );
};

export default MercadoPagoPaymentResultPage;
