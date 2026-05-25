import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HostContactInfo } from '../../types';
import { shouldShowHostContact } from '../../core/services/hostContactVisibility';

interface HostContactSectionProps {
  status: string;
  hostContact?: HostContactInfo | null;
  /** i18n key prefix, default `reservationLookup.hostContact` */
  translationKeyPrefix?: string;
}

const HostContactSection: React.FC<HostContactSectionProps> = ({
  status,
  hostContact,
  translationKeyPrefix = 'reservationLookup.hostContact',
}) => {
  const { t } = useTranslation();

  if (!shouldShowHostContact(status) || !hostContact) {
    return null;
  }

  const { name, email, phone } = hostContact;
  const hasAny = Boolean(name?.trim() || email?.trim() || phone?.trim());
  if (!hasAny) {
    return null;
  }

  const label = (suffix: string) => t(`${translationKeyPrefix}.${suffix}`);
  const notAvailable = label('notAvailable');

  return (
    <div className="rounded-2xl border border-warm-gray bg-warm-gray-light/50 p-4 space-y-2 text-sm text-charcoal">
      <h3 className="text-base font-semibold text-navy m-0">{label('heading')}</h3>
      {name?.trim() ? (
        <p className="m-0">
          <span className="font-semibold">{label('nameLabel')}</span> {name.trim()}
        </p>
      ) : null}
      <p className="m-0">
        <span className="font-semibold">{label('emailLabel')}</span>{' '}
        {email?.trim() ? (
          <a href={`mailto:${email.trim()}`} className="text-navy hover:text-gold underline">
            {email.trim()}
          </a>
        ) : (
          notAvailable
        )}
      </p>
      <p className="m-0">
        <span className="font-semibold">{label('phoneLabel')}</span>{' '}
        {phone?.trim() ? (
          <a href={`tel:${phone.trim()}`} className="text-navy hover:text-gold underline">
            {phone.trim()}
          </a>
        ) : (
          notAvailable
        )}
      </p>
    </div>
  );
};

export default HostContactSection;
