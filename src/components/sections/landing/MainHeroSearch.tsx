import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CitySuggestInput from './CitySuggestInput';

const MainHeroSearch: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [locationQuery, setLocationQuery] = useState('');

  return (
    <form
      className="mt-6 grid grid-cols-1 gap-3 w-full max-w-[520px] p-4 rounded-2xl border border-navy/10 bg-white shadow-[0_12px_40px_-18px_rgba(10,26,47,0.28)]"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const fd = new FormData(form);
        const checkIn = String(fd.get('checkIn') ?? '').trim();
        const checkOut = String(fd.get('checkOut') ?? '').trim();
        const params = new URLSearchParams();
        const trimmedLocation = locationQuery.trim();
        if (trimmedLocation) {
          params.set('q', trimmedLocation);
        }
        if (checkIn && checkOut && checkOut <= checkIn) {
          return;
        }
        if (checkIn) {
          params.set('checkIn', checkIn);
        }
        if (checkOut) {
          params.set('checkOut', checkOut);
        }
        const query = params.toString();
        navigate(query ? `/search?${query}` : '/search');
      }}
    >
      <CitySuggestInput
        id="hero-search-city"
        name="city"
        label={t('landing.hero.search.locationLabel')}
        placeholder={t('landing.hero.search.locationPlaceholder')}
        ariaLabel={t('landing.hero.search.cityAria')}
        value={locationQuery}
        onChange={setLocationQuery}
      />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label htmlFor="hero-search-check-in" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
          {t('landing.hero.search.checkInLabel')}
          <input
            id="hero-search-check-in"
            className="w-full border border-navy/20 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
            type="date"
            name="checkIn"
            aria-label={t('landing.hero.search.checkInAria')}
          />
        </label>
        <label htmlFor="hero-search-check-out" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
          {t('landing.hero.search.checkOutLabel')}
          <input
            id="hero-search-check-out"
            className="w-full border border-navy/20 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
            type="date"
            name="checkOut"
            aria-label={t('landing.hero.search.checkOutAria')}
          />
        </label>
        <button
          className="inline-flex items-center justify-center rounded-full border-2 border-gold bg-gold text-navy font-semibold px-6 py-3 transition-all hover:bg-navy hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
          type="submit"
        >
          {t('landing.hero.search.submit')}
        </button>
      </div>
    </form>
  );
};

export default MainHeroSearch;
