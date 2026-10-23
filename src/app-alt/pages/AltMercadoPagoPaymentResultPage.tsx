import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import MercadoPagoReturnNotice from '../../components/reservation/MercadoPagoReturnNotice';
import {
  buildLegacyListingRedirect,
  hasMercadoPagoReturnSignal,
  resolveMercadoPagoReturnOutcome,
} from '../../utils/mercadoPagoReturn';

export default function AltMercadoPagoPaymentResultPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const redirectTo = buildLegacyListingRedirect(searchParams, '/venue');
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  const bookingId = searchParams.get('bookingId')?.trim() ?? '';
  const hasSignal = hasMercadoPagoReturnSignal(searchParams);

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
        <MercadoPagoReturnNotice
          className="mx-auto max-w-4xl"
          bookingId={bookingId}
          outcome={hasSignal ? resolveMercadoPagoReturnOutcome(searchParams) : 'unknown'}
          trustUrlStatus
          alwaysShowLookup
        />
      </div>
    </>
  );
}
