import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card } from '../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Terms: React.FC = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            By accessing and using Holiday Trips, you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
          <p>
            These Terms of Service apply to all visitors, users, and others who access or use our services.
            By using our services, you agree to be bound by these terms.
          </p>
        </div>
      ),
    },
    {
      id: 'use-license',
      title: 'Use License',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            Permission is granted to temporarily download one copy of the materials on Holiday Trips
            for personal, non-commercial transitory viewing only.
          </p>
          <p>
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>modify or copy the materials</li>
            <li>use the materials for any commercial purpose or for any public display</li>
            <li>attempt to reverse engineer any software contained on our website</li>
            <li>remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'user-account',
      title: 'User Account',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. You are responsible for safeguarding the password
            and for all activities that occur under your account.
          </p>
          <p>
            You agree not to disclose your password to any third party. You must notify us
            immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </div>
      ),
    },
    {
      id: 'bookings',
      title: 'Bookings and Payments',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            All bookings are subject to availability and confirmation. Prices are subject to change
            without notice until a booking is confirmed.
          </p>
          <p>
            Payment must be made in full at the time of booking unless otherwise agreed.
            We accept major credit cards and other payment methods as displayed on our platform.
          </p>
          <p>
            Cancellations and refunds are subject to the specific property's cancellation policy,
            which will be clearly displayed during the booking process.
          </p>
        </div>
      ),
    },
    {
      id: 'property-standards',
      title: 'Property Standards',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            We strive to provide properties that meet high standards of quality, cleanliness, and safety.
            All properties listed on our platform have been inspected and approved by our team.
          </p>
          <p>
            However, we cannot guarantee the condition of properties at all times, and guests should
            report any issues immediately upon arrival to allow us to address them promptly.
          </p>
        </div>
      ),
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            In no event shall Holiday Trips or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption)
            arising out of the use or inability to use the materials on our platform.
          </p>
          <p>
            We shall not be held responsible for any direct, indirect, incidental, consequential,
            or punitive damages arising from your use of our services.
          </p>
        </div>
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs
            your use of our services, to understand our practices.
          </p>
          <p>
            By using our services, you consent to the collection and use of information in accordance
            with our Privacy Policy.
          </p>
        </div>
      ),
    },
    {
      id: 'termination',
      title: 'Termination',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability,
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the service will cease immediately. If you wish to
            terminate your account, you may simply discontinue using the service.
          </p>
        </div>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
            If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
          </p>
          <p>
            What constitutes a material change will be determined at our sole discretion. By continuing
            to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-warm-gray-light p-4 rounded-xl">
            <p><strong>Email:</strong> legal@holidaytrips.com</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Address:</strong> 123 Luxury Lane, San Francisco, CA 94105</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-6">
            Terms of <span className="font-bold text-gold">Service</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed">
            Please read these terms carefully before using Holiday Trips.
            By using our services, you agree to be bound by these terms.
          </p>
          <p className="text-sm text-charcoal mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} variant="default" className="overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-warm-gray-light transition-colors"
                >
                  <h2 className="text-xl font-semibold text-navy">
                    {section.title}
                  </h2>
                  {openSections.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  )}
                </button>

                {openSections.has(section.id) && (
                  <div className="px-8 pb-6">
                    {section.content}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
            <h3 className="text-lg font-semibold text-navy mb-3">
              Questions About Our Terms?
            </h3>
            <p className="text-charcoal mb-4">
              If you have any questions about these Terms of Service or need clarification
              on any point, please don't hesitate to contact our legal team.
            </p>
            <a
              href="mailto:legal@holidaytrips.com"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-navy hover:text-gold transition-all duration-200"
            >
              Contact Legal Team
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
