import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import HeroSplit from '../components/sections/HeroSplit';
import { getFeaturedProperties, getFavoriteProperties } from '../services/propertyService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import type { Property } from '../types';
import { getMemberProfile } from '../services/memberService';
import { supabase } from '../lib/supabase';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPropertiesAndFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getFeaturedProperties();
        setFeaturedProperties(properties);

        if (user) {
          try {
            const member = await getMemberProfile(user.id);
            if (member) {
              setMemberId(member.id);
              const favorites = await getFavoriteProperties(member.id);
              setWishlistIds(favorites.map((property) => property.id));
            } else {
              setWishlistIds([]);
            }
          } catch (favErr) {
            console.error('Error fetching favorites for landing page:', favErr);
          }
        } else {
          setWishlistIds([]);
          setMemberId(null);
        }
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load featured properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPropertiesAndFavorites();
  }, [user]);

  const handleToggleWishlist = async (propertyId: string) => {
    if (!user) return;

    try {
      let currentMemberId = memberId;

      if (!currentMemberId) {
        const member = await getMemberProfile(user.id);
        if (!member) {
          return;
        }
        currentMemberId = member.id;
        setMemberId(member.id);
      }

      const isCurrentlyInWishlist = wishlistIds.includes(propertyId);

      if (isCurrentlyInWishlist) {
        const { error: deleteError } = await supabase
          .from('Favorites')
          .delete()
          .eq('MemberId', currentMemberId)
          .eq('EstatePropertyId', propertyId);

        if (deleteError) {
          console.error('Error removing property from wishlist:', deleteError);
          return;
        }

        setWishlistIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        const { error: insertError } = await supabase
          .from('Favorites')
          .insert({
            MemberId: currentMemberId,
            EstatePropertyId: propertyId,
            FavoritedAt: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error adding property to wishlist:', insertError);
          return;
        }

        setWishlistIds((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error('Error toggling wishlist status:', err);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSplit />

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('landing.featured.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('landing.featured.title')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-3xl mx-auto">{t('landing.featured.description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="col-span-full">
                <ErrorMessage message={t('landing.featured.errors.loadFailed')} />
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12 text-charcoal text-lg">
                {t('landing.featured.empty')}
              </div>
            ) : (
              featuredProperties.slice(0, 6).map((property, index) => {
                const image = property.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80';
                return (
                  <article key={property.id} className="relative min-h-[220px] border border-navy/15 rounded-2xl overflow-hidden bg-navy group">
                    <Link to={`/property/${property.id}`} className="absolute inset-0 z-10" aria-label={property.title} />
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url("${image}")` }} />
                    <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/35" />
                    <div className="absolute left-4 right-4 bottom-4 z-20 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="m-0 text-white text-lg font-semibold">{property.title}</h3>
                        <p className="m-0 mt-1 text-white/85 text-sm">{property.location}</p>
                      </div>
                      {index === 0 && (
                        <span className="rounded-full px-3 py-1 text-xs font-bold bg-gold text-navy whitespace-nowrap">
                          {t('landing.featured.popular')}
                        </span>
                      )}
                    </div>
                    {!!user && (
                      <button
                        type="button"
                        onClick={() => handleToggleWishlist(property.id)}
                        className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-white/90 text-navy text-base font-bold hover:bg-white"
                        aria-label={wishlistIds.includes(property.id) ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
                      >
                        {wishlistIds.includes(property.id) ? '♥' : '♡'}
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <div className="text-center">
            <Link to="/search">
              <Button variant="outline" size="lg">
                {t('landing.featured.viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">{t('landing.platform.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((card) => (
              <article key={`platform-${card}`} className="rounded-2xl border border-navy/15 bg-warm-gray p-5 hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-white text-navy border border-navy/15 font-bold">
                  {card}
                </div>
                <h3 className="mt-4 mb-2 text-lg font-semibold text-navy">{t(`landing.platform.cards.${card}.title`)}</h3>
                <p className="m-0 text-sm text-charcoal/85">{t(`landing.platform.cards.${card}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('landing.howItWorks.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('landing.howItWorks.title')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-3xl mx-auto">{t('landing.howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((step) => (
              <article key={`how-${step}`} className="rounded-2xl border border-navy/15 bg-white p-5">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-warm-gray text-navy border border-navy/15 font-bold">
                  {step}
                </div>
                <h3 className="mt-4 mb-2 text-lg font-semibold text-navy">{t(`landing.howItWorks.steps.${step}.title`)}</h3>
                <p className="m-0 text-sm text-charcoal/85">{t(`landing.howItWorks.steps.${step}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Landing;
