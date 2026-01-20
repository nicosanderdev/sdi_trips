import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import Button from './Button';
import Modal from './Modal';
import ErrorMessage from '../common/ErrorMessage';
import type { MFAEnrollment } from '../../types';

export interface MFAEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentData: MFAEnrollment | null;
  onVerify: (code: string) => Promise<void>;
  isLoading?: boolean;
}

const MFAEnrollmentModal: React.FC<MFAEnrollmentModalProps> = ({
  isOpen,
  onClose,
  enrollmentData,
  onVerify,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate QR code when enrollment data is available
  useEffect(() => {
    if (enrollmentData?.totp?.uri) {
      QRCode.toDataURL(enrollmentData.totp.uri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1A2332', // navy color
          light: '#FFFFFF'
        }
      })
        .then(setQrCodeDataUrl)
        .catch(err => {
          console.error('Error generating QR code:', err);
          setError('Failed to generate QR code');
        });
    } else {
      setQrCodeDataUrl(null);
    }
  }, [enrollmentData]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(null);
      setShowSecret(false);
      // Focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleInputKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setError(null);
      await onVerify(fullCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
    }
  };

  const fullCode = code.join('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('mfa.enrollment.title')} size="lg">
      <div className="space-y-6">
        {/* Description */}
        <div className="text-center">
          <p className="text-charcoal mb-4">{t('mfa.enrollment.description')}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-sm text-charcoal">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-navy text-xs font-semibold flex items-center justify-center">1</span>
            <p>{t('mfa.enrollment.step1')}</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-navy text-xs font-semibold flex items-center justify-center">2</span>
            <p>{t('mfa.enrollment.step2')}</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold text-navy text-xs font-semibold flex items-center justify-center">3</span>
            <p>{t('mfa.enrollment.step3')}</p>
          </div>
        </div>

        {/* QR Code */}
        {qrCodeDataUrl && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <img
                src={qrCodeDataUrl}
                alt="MFA QR Code"
                className="w-48 h-48"
              />
            </div>
          </div>
        )}

        {/* Manual Entry */}
        {enrollmentData?.totp?.secret && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-sm text-gold hover:text-navy underline"
            >
              {showSecret ? 'Hide' : 'Show'} secret key
            </button>
            {showSecret && (
              <div className="mt-2 p-3 bg-warm-gray rounded-lg">
                <p className="text-sm text-charcoal mb-1">{t('mfa.enrollment.manualEntry')}</p>
                <code className="text-xs font-mono bg-white px-2 py-1 rounded border">
                  {enrollmentData.totp.secret}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Code Input */}
        <div>
          <label className="block text-sm font-medium text-navy mb-3 text-center">
            Enter the 6-digit code from your authenticator app
          </label>
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleInputKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              disabled={isLoading}
            />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleVerify}
            disabled={fullCode.length !== 6 || isLoading}
          >
            {isLoading ? 'Verifying...' : t('mfa.enrollment.verifyCode')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MFAEnrollmentModal;