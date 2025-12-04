import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
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
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen flex items-center justify-center py-12 px-8">
          <div className="max-w-md w-full">
            {/* Back Link */}
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>

            {/* Success Card */}
            <Card variant="default" className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-semibold text-navy mb-2">
                  Check Your Email
                </h1>
                <p className="text-charcoal">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-navy">{email}</span>
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-charcoal">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResend}
                    className="text-gold hover:text-navy transition-colors font-medium"
                  >
                    try again
                  </button>
                </p>

                <div className="border-t border-gray-200 pt-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center w-full px-6 py-3 bg-navy text-white font-semibold rounded-full hover:bg-navy-dark transition-all duration-200"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </Card>

            {/* Help Text */}
            <p className="text-center text-sm text-charcoal mt-6">
              Need help?{' '}
              <a
                href="mailto:support@holidaytrips.com"
                className="text-gold hover:text-navy transition-colors font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-8">
        <div className="max-w-md w-full">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>

          {/* Forgot Password Card */}
          <Card variant="default" className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-gold" />
              </div>
              <h1 className="text-2xl font-semibold text-navy mb-2">
                Forgot Your Password?
              </h1>
              <p className="text-charcoal">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
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
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-charcoal text-center">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-gold hover:text-navy transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-charcoal mt-6">
            Having trouble?{' '}
            <a
              href="mailto:support@holidaytrips.com"
              className="text-gold hover:text-navy transition-colors font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
