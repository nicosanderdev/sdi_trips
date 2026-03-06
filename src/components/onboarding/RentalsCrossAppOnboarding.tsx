import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getMemberProfile } from '../../services/memberService';
import { hasUsedApp, recordAppUsed, APP_NAMES } from '../../services/UserAppsService';
import { Modal, Button } from '../ui';

/**
 * One-time welcome modal for the rentals app when the user has no UserApps row for rentals_app
 * and has completed profile onboarding (needsOnboarding is false). Deferred until after profile
 * onboarding to avoid overlapping with the profile onboarding tour on first login.
 * After the user clicks Continue, we record the app usage so the modal is not shown again.
 */
const RentalsCrossAppOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    Promise.all([
      hasUsedApp(APP_NAMES.RENTALS_APP, user.id),
      getMemberProfile(user.id).catch(() => null),
    ]).then(([used, member]) => {
      if (!cancelled && !used && member && !member.needsOnboarding) {
        setShouldShowModal(true);
      }
      setCheckDone(true);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const handleContinue = async () => {
    if (user) {
      await recordAppUsed(APP_NAMES.RENTALS_APP, user.id);
    }
    setShouldShowModal(false);
  };

  if (!checkDone || !shouldShowModal) {
    return null;
  }

  return (
    <Modal
      isOpen={shouldShowModal}
      onClose={handleContinue}
      title={t('onboarding.rentalsCrossApp.title')}
      size="md"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className="text-sm leading-relaxed">
          <p className="text-gray-700 mb-3">{t('onboarding.rentalsCrossApp.body1')}</p>
          <p className="text-gray-700 mb-3">{t('onboarding.rentalsCrossApp.body2')}</p>
          <p className="text-gray-700">{t('onboarding.rentalsCrossApp.body3')}</p>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={handleContinue}>{t('onboarding.rentalsCrossApp.continue')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RentalsCrossAppOnboarding;
