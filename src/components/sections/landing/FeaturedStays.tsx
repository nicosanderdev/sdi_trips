import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

export interface FeaturedStayCard {
  id: string;
  title: string;
  location: string;
  image: string;
  href: string;
  meta?: string;
}

interface FeaturedStaysProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  popularBadge: string;
  emptyMessage: string;
  errorMessage?: string | null;
  loading: boolean;
  items: FeaturedStayCard[];
  wishlistIds?: string[];
  onToggleWishlist?: (id: string) => void;
  showWishlist?: boolean;
  addWishlistLabel?: string;
  removeWishlistLabel?: string;
}

const FALLBACK_IMAGE = '/landing/porch-800.jpg';

const FeaturedStays: React.FC<FeaturedStaysProps> = ({
  eyebrow,
  title,
  subtitle,
  viewAllLabel,
  popularBadge,
  emptyMessage,
  errorMessage,
  loading,
  items,
  wishlistIds = [],
  onToggleWishlist,
  showWishlist = false,
  addWishlistLabel,
  removeWishlistLabel,
}) => {
  const { t } = useTranslation();
  const revealRef = useRevealOnScroll<HTMLElement>();
  const displayItems = items.slice(0, 5);

  const renderCard = (item: FeaturedStayCard, index: number, large = false) => {
    const image = item.image || FALLBACK_IMAGE;
    return (
      <article
        key={item.id}
        className={`group relative flex flex-col ${large ? 'md:row-span-2' : ''}`}
      >
        <div
          className={`relative overflow-hidden bg-warm-gray ${
            large ? 'aspect-[4/5] md:h-full md:aspect-auto md:min-h-[28rem]' : 'aspect-[4/3]'
          }`}
        >
          <Link to={item.href} className="absolute inset-0 z-10" aria-label={item.title} />
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {index === 0 && (
            <span className="absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-xs font-bold bg-gold text-navy">
              {popularBadge}
            </span>
          )}
          {showWishlist && onToggleWishlist && (
            <button
              type="button"
              onClick={() => onToggleWishlist(item.id)}
              className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-white/90 text-navy text-base font-bold hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={
                wishlistIds.includes(item.id)
                  ? removeWishlistLabel ?? t('wishlist.removeFromWishlist')
                  : addWishlistLabel ?? t('wishlist.addToWishlist')
              }
            >
              {wishlistIds.includes(item.id) ? '♥' : '♡'}
            </button>
          )}
        </div>
        <div className="pt-3 pb-1">
          <h3 className="m-0 text-base md:text-lg font-semibold text-navy">
            <Link to={item.href} className="hover:underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
              {item.title}
            </Link>
          </h3>
          <p className="m-0 mt-0.5 text-sm text-charcoal/75">{item.location}</p>
          {item.meta ? (
            <p className="m-0 mt-0.5 text-xs text-charcoal/60">{item.meta}</p>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <section ref={revealRef} className="landing-reveal py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-2xl mb-10 md:mb-12">
          {eyebrow ? (
            <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
              <span className="inline-block h-px w-8 bg-gold" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h2 className="m-0 mt-3 text-3xl md:text-4xl font-extrabold text-navy tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="m-0 mt-3 text-charcoal/80 text-lg max-w-xl">{subtitle}</p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : errorMessage ? (
          <ErrorMessage message={errorMessage} />
        ) : displayItems.length === 0 ? (
          <p className="text-center py-12 text-charcoal text-lg m-0">{emptyMessage}</p>
        ) : (
          <>
            {/* Desktop asymmetric grid */}
            <div className="hidden md:grid md:grid-cols-3 md:grid-rows-2 gap-5 mb-10 auto-rows-fr">
              {displayItems[0] ? renderCard(displayItems[0], 0, true) : null}
              {displayItems.slice(1).map((item, i) => renderCard(item, i + 1))}
            </div>

            {/* Mobile scroll-snap */}
            <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 mb-10">
              {displayItems.map((item, index) => (
                <div key={item.id} className="shrink-0 w-[78%] snap-center">
                  {renderCard(item, index)}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="text-center">
          <Link to="/search">
            <Button variant="outline" size="lg">
              {viewAllLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStays;
