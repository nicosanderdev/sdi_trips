import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import HumanTouchSection from '../../components/sections/HumanTouchSection';
import {
  LandingHero,
  FeaturedStays,
  TrustEditorial,
  ProcessTimeline,
  type FeaturedStayCard,
} from '../../components/sections/landing';
import { getFeaturedProperties, getFavoriteProperties } from '../../services/propertyService';
import { useAuth } from '../../hooks/useAuth';
import type { Property } from '../../types';
import { getMemberProfile } from '../../services/memberService';
import { supabase } from '../../lib/supabase';
import { isSearchPageEnabled } from '../../core/config/searchPageVisibility';

const FALLBACK_IMAGE = '/landing/porch-800.jpg';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSearchPageEnabled) return;

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

  const featuredCards: FeaturedStayCard[] = featuredProperties.map((property) => ({
    id: property.id,
    title: property.title,
    location: property.location,
    image: property.images?.[0] || FALLBACK_IMAGE,
    href: `/property/${property.id}`,
  }));

  const processSteps = [1, 2, 3, 4].map((step) => ({
    title: t(`landing.howItWorks.steps.${step}.title`),
    description: t(`landing.howItWorks.steps.${step}.description`),
  }));

  return (
    <Layout>
      <LandingHero variant="main" />

      {isSearchPageEnabled && (
        <FeaturedStays
          eyebrow={t('landing.featured.eyebrow')}
          title={t('landing.featured.title')}
          subtitle={t('landing.featured.subtitle')}
          viewAllLabel={t('landing.featured.viewAll')}
          popularBadge={t('landing.featured.popular')}
          emptyMessage={t('landing.featured.empty')}
          errorMessage={error ? t('landing.featured.errors.loadFailed') : null}
          loading={loading}
          items={featuredCards}
          showWishlist={!!user}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      <TrustEditorial />

      <ProcessTimeline
        eyebrow={t('landing.howItWorks.eyebrow')}
        title={t('landing.howItWorks.title')}
        subtitle={t('landing.howItWorks.subtitle')}
        steps={processSteps}
        ctaLabel={t('landing.hero.cta.search')}
        ctaFallbackLabel={t('landing.hero.cta.manage')}
      />

      <HumanTouchSection />
    </Layout>
  );
};

export default Landing;
