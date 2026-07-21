import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import MercadoPagoPaymentReturn from '../../components/reservation/MercadoPagoPaymentReturn';

const MercadoPagoPaymentResultPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="bg-cream min-h-[60vh] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <p className="sr-only">{t('mercadoPago.return.pageLabel')}</p>
          <MercadoPagoPaymentReturn />
        </div>
      </div>
    </Layout>
  );
};

export default MercadoPagoPaymentResultPage;
