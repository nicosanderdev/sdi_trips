import React from 'react';
import { Layout } from '../components/layout';
import { Card } from '../components/ui';
import { Award, Heart, Globe, Shield } from 'lucide-react';

const About: React.FC = () => {
  const teamMembers = [
    {
      name: 'Anna Svensson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      bio: 'With over 15 years in luxury hospitality, Anna founded Holiday Trips to revolutionize how people experience vacation homes.',
    },
    {
      name: 'Marcus Johnson',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: 'Marcus ensures every property meets our exacting standards for luxury, comfort, and authenticity.',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Customer Experience Director',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Elena leads our 24/7 customer support team, ensuring every guest has an exceptional experience.',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Hospitality',
      description: 'We believe that every vacation should feel like coming home to a place that truly cares about your comfort and happiness.',
    },
    {
      icon: Award,
      title: 'Excellence in Every Detail',
      description: 'From property selection to guest support, we maintain the highest standards in everything we do.',
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'Our international team brings diverse experiences and insights to create truly special vacation experiences.',
    },
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We build lasting relationships through honest communication and reliable service you can count on.',
    },
  ];

  const stats = [
    { number: '800+', label: 'Curated Properties' },
    { number: '50+', label: 'Countries' },
    { number: '10,000+', label: 'Happy Guests' },
    { number: '4.9/5', label: 'Average Rating' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-thin text-navy mb-6">
            About <span className="font-bold text-gold">Holiday Trips</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed max-w-3xl mx-auto">
            We're on a mission to transform how people experience vacation homes.
            By curating extraordinary properties and providing unparalleled service,
            we create memories that last a lifetime.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">
                Our <span className="font-bold text-gold">Story</span>
              </h2>
              <div className="space-y-6 text-charcoal leading-relaxed">
                <p>
                  Holiday Trips began with a simple idea: vacation rentals should be as
                  luxurious and memorable as the finest hotels, but with the space and
                  privacy of a home.
                </p>
                <p>
                  Our founder, Anna Svensson, experienced this firsthand when searching
                  for the perfect holiday home for her family. Frustrated by the lack of
                  quality options and inconsistent experiences, she decided to create
                  a platform that would change the vacation rental industry forever.
                </p>
                <p>
                  Today, we've curated over 800 exceptional properties across 50+
                  countries, each personally inspected and vetted to ensure they meet
                  our uncompromising standards for luxury, comfort, and authenticity.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Holiday Trips team"
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg text-warm-gray-light font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
              Our <span className="font-bold text-gold">Values</span>
            </h2>
            <p className="text-xl text-charcoal max-w-2xl mx-auto">
              These principles guide everything we do and shape the experiences we create for our guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} variant="default" className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-3">
                      {value.title}
                    </h3>
                    <p className="text-charcoal leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
              Meet Our <span className="font-bold text-gold">Team</span>
            </h2>
            <p className="text-xl text-charcoal max-w-2xl mx-auto">
              The passionate individuals behind Holiday Trips, dedicated to creating
              extraordinary experiences for our guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} variant="elevated" className="text-center p-8">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg"
                />
                <h3 className="text-xl font-semibold text-navy mb-2">
                  {member.name}
                </h3>
                <p className="text-gold font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-charcoal leading-relaxed">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">
            Join Our <span className="font-bold text-gold">Community</span>
          </h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">
            Experience the difference that passion, attention to detail, and genuine care can make.
            Your perfect holiday home awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
            >
              Get Started Today
            </a>
            <a
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
            >
              Browse Properties
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
