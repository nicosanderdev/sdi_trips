import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { Card, Button, Input } from '../../components/ui';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

type ForgotPasswordProps = {
  variant?: 'main' | 'alt';
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ variant = 'main' }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const supportMailto =
    variant === 'alt' ? `mailto:${t('alt.footer.email')}` : 'mailto:support@holidaytrips.com';

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('auth.errors.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('auth.errors.emailInvalid'));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleResend = () => {
    setIsSubmitted(false);
    setError('');
  };

  if (isSubmitted) {
    const submitted = (
      <div className="min-h-screen flex items-center justify-center py-12 px-8">
        <div className="max-w-md w-full">
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('auth.forgotPasswordPage.backToSignIn')}</span>
          </Link>

          <Card variant="default" className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-semibold text-navy mb-2">{t('auth.forgotPasswordPage.checkEmailTitle')}</h1>
              <p className="text-charcoal">
                {t('auth.forgotPasswordPage.checkEmailIntro')}{' '}
                <span className="font-medium text-navy">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-charcoal">
                {t('auth.forgotPasswordPage.resendHint')}{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-gold hover:text-navy transition-colors font-medium"
                >
                  {t('auth.forgotPasswordPage.tryAgain')}
                </button>
              </p>

              <div className="border-t border-gray-200 pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-navy text-white font-semibold rounded-full hover:bg-navy-dark transition-all duration-200"
                >
                  {t('auth.forgotPasswordPage.backToSignIn')}
                </Link>
              </div>
            </div>
          </Card>

          <p className="text-center text-sm text-charcoal mt-6">
            {t('auth.forgotPasswordPage.needHelp')}{' '}
            <a href={supportMailto} className="text-gold hover:text-navy transition-colors font-medium">
              {t('auth.forgotPasswordPage.contactSupport')}
            </a>
          </p>
        </div>
      </div>
    );
    return variant === 'main' ? <Layout showFooter={false}>{submitted}</Layout> : submitted;
  }

  const formView = (
    <div className="min-h-screen flex items-center justify-center py-12 px-8">
      <div className="max-w-md w-full">
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('auth.forgotPasswordPage.backToSignIn')}</span>
        </Link>

        <Card variant="default" className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-gold" />
            </div>
            <h1 className="text-2xl font-semibold text-navy mb-2">{t('auth.forgotPasswordPage.forgotTitle')}</h1>
            <p className="text-charcoal">{t('auth.forgotPasswordPage.forgotSubtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label={t('auth.forgotPasswordPage.emailLabel')}
              placeholder={t('auth.forgotPasswordPage.emailPlaceholder')}
              value={email}
              onChange={setEmail}
              error={error}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('auth.forgotPasswordPage.sending') : t('auth.forgotPasswordPage.sendResetLink')}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-charcoal text-center">
              {t('auth.forgotPasswordPage.rememberPassword')}{' '}
              <Link to="/login" className="text-gold hover:text-navy transition-colors font-medium">
                {t('auth.signInHere')}
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-sm text-charcoal mt-6">
          {t('auth.forgotPasswordPage.havingTrouble')}{' '}
          <a href={supportMailto} className="text-gold hover:text-navy transition-colors font-medium">
            {t('auth.forgotPasswordPage.contactSupport')}
          </a>
        </p>
      </div>
    </div>
  );

  if (variant === 'main') {
    return <Layout showFooter={false}>{formView}</Layout>;
  }
  return formView;
};

export default ForgotPassword;
