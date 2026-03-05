import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Input, Modal } from '../components/ui';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ErrorMessage from '../components/common/ErrorMessage';
import { getMemberProfile } from '../services/memberService';
import { resendEmailVerification } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, verifyMFALogin, cancelMFAChallenge } = useAuth();
  const { t } = useTranslation();
  const fromSignupState = (location.state as { fromSignup?: boolean; email?: string } | null) || null;
  const initialEmail = fromSignupState?.email ?? '';
  const [formData, setFormData] = useState({
    email: initialEmail,
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isMFAVerifying, setIsMFAVerifying] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear auth error when user starts typing
    if (authError) {
      setAuthError(null);
    }
    if (field === 'email') {
      setResendMessage(null);
      setResendError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error, mfaRequired, userId } = await signIn(formData.email, formData.password);

      if (error) {
        setAuthError(error.message || t('auth.errors.loginFailed'));
      } else if (mfaRequired) {
        // MFA required, show MFA verification modal
        setShowMFAVerification(true);
      } else if (userId) {
        try {
          const member = await getMemberProfile(userId);
          if (member && member.needsOnboarding) {
            navigate('/profile');
          } else {
            navigate('/');
          }
        } catch {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setAuthError(t('auth.errors.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendError(null);
    setResendMessage(null);

    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: t('auth.errors.emailRequired') }));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: t('auth.errors.emailInvalid') }));
      return;
    }

    setIsResendingVerification(true);
    try {
      await resendEmailVerification(formData.email);
      setResendMessage(t('auth.verifyEmailResent'));
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendError(t('auth.errors.resendVerificationFailed'));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleMFAVerify = async () => {
    const fullCode = mfaCode.join('');
    if (fullCode.length !== 6) {
      setMfaError('Please enter the complete 6-digit code');
      return;
    }

    setIsMFAVerifying(true);
    setMfaError(null);

    try {
      const { error, userId } = await verifyMFALogin(fullCode);

      if (error) {
        setMfaError(error.message || 'Invalid authentication code');
      } else {
        setShowMFAVerification(false);
        if (userId) {
          try {
            const member = await getMemberProfile(userId);
            if (member && member.needsOnboarding) {
              navigate('/profile');
            } else {
              navigate('/');
            }
          } catch {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setMfaError('Verification failed. Please try again.');
    } finally {
      setIsMFAVerifying(false);
    }
  };

  const handleCancelMFA = () => {
    setShowMFAVerification(false);
    setMfaCode(['', '', '', '', '', '']);
    setMfaError(null);
    cancelMFAChallenge();
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-8">
        <div className="max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Form */}
            <div className="space-y-8">
              {/* Back Link */}
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('auth.backToHome')}</span>
              </Link>

              {/* Header */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-thin text-navy">
                  {(() => {
                    const text = t('auth.welcomeBack');
                    const words = text.split(' ');
                    const lastWord = words.pop();
                    return (
                      <>
                        {words.join(' ')} <span className="font-bold text-gold">{lastWord}</span>
                      </>
                    );
                  })()}
                </h1>
                <p className="text-xl text-charcoal">
                  {t('auth.signInToAccount')}
                </p>
              </div>

              {/* Login Form */}
              <Card variant="default" className="p-8">
                {(fromSignupState?.fromSignup || resendMessage || resendError) && (
                  <div className="mb-6">
                    <div className="p-3 rounded-lg border text-sm"
                      style={{ borderColor: '#FBBF24', backgroundColor: '#FFFBEB', color: '#92400E' }}>
                      <p className="font-semibold">
                        {t('auth.verifyEmailPrompt')}
                      </p>
                      <p className="mt-1">
                        {t('auth.verifyEmailDescription')}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-charcoal">
                      <span>{t('auth.verifyEmailDidntReceive')}</span>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        className="text-gold hover:text-navy font-medium disabled:opacity-50"
                        disabled={isResendingVerification}
                      >
                        {isResendingVerification
                          ? t('auth.verifyEmailResending')
                          : t('auth.verifyEmailResend')}
                      </button>
                    </div>
                    {resendMessage && (
                      <p className="mt-2 text-xs text-green-700 font-medium">
                        {resendMessage}
                      </p>
                    )}
                    {resendError && (
                      <p className="mt-2 text-xs text-red-600 font-medium">
                        {resendError}
                      </p>
                    )}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    label={t('auth.emailAddress')}
                    placeholder={t('auth.enterYourEmail')}
                    value={formData.email}
                    onChange={(value) => handleChange('email', value)}
                    error={errors.email}
                    required
                  />

                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      label={t('auth.password')}
                      placeholder={t('auth.enterYourPassword')}
                      value={formData.password}
                      onChange={(value) => handleChange('password', value)}
                      error={errors.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-charcoal">{t('auth.rememberMe')}</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-gold hover:text-navy transition-colors font-medium"
                    >
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                  </Button>

                  {authError && (
                    <ErrorMessage message={authError} />
                  )}
                </form>

                {/* Social Login Options */}
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-charcoal">{t('auth.orContinueWith')}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="ml-2">{t('auth.google')}</span>
                    </button>
                    <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 16.99 22 12z" />
                      </svg>
                      <span className="ml-2">{t('auth.facebook')}</span>
                    </button>
                  </div>
                </div>
              </Card>

              {/* Sign Up Link */}
              <p className="text-center text-charcoal">
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  to="/register"
                  className="text-gold hover:text-navy transition-colors font-semibold"
                >
                  {t('auth.signUpHere')}
                </Link>
              </p>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt={t('auth.luxuryHolidayHome')}
                  className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent rounded-3xl"></div>

                {/* Floating Quote */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-gold">
                  <blockquote className="text-navy font-medium italic text-lg mb-2">
                    "{t('auth.testimonialQuote')}"
                  </blockquote>
                  <cite className="text-gold font-semibold">— {t('auth.testimonialAuthor')}</cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MFA Verification Modal */}
      <Modal
        isOpen={showMFAVerification}
        onClose={handleCancelMFA}
        title={t('mfa.verification.title')}
      >
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-charcoal mb-4">{t('mfa.verification.description')}</p>
            <p className="text-sm text-gray-500">
              {t('mfa.verification.required')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-3 text-center">
              Enter the 6-digit code from your authenticator app
            </label>
            <div className="flex justify-center space-x-2">
              {mfaCode.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newCode = [...mfaCode];
                    newCode[index] = e.target.value.replace(/\D/g, '');
                    setMfaCode(newCode);

                    // Auto-focus next input
                    if (e.target.value && index < 5) {
                      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
                      prevInput?.focus();
                    }
                  }}
                  data-index={index}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                  disabled={isMFAVerifying}
                />
              ))}
            </div>
          </div>

          {mfaError && (
            <div className="text-center">
              <ErrorMessage message={mfaError} />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancelMFA} disabled={isMFAVerifying}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleMFAVerify}
              disabled={mfaCode.join('').length !== 6 || isMFAVerifying}
            >
              {isMFAVerifying ? 'Verifying...' : t('mfa.verification.verify')}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Login;
