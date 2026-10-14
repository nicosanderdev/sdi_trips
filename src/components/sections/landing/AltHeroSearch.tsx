import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import CitySuggestInput from './CitySuggestInput';

const AltHeroSearch: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [locationQuery, setLocationQuery] = useState('');
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');

  return (
    <form
      className="mt-6 grid grid-cols-1 gap-3 w-full max-w-[520px] p-4 rounded-2xl border border-navy/10 bg-white shadow-[0_12px_40px_-18px_rgba(43,43,43,0.28)]"
      onSubmit={(event) => {
        event.preventDefault();
        if (eventDateFrom && eventDateTo && eventDateTo < eventDateFrom) {
          return;
        }
        const params = new URLSearchParams();
        const trimmedLocation = locationQuery.trim();
        if (trimmedLocation) {
          params.set('location', trimmedLocation);
        }
        if (eventDateFrom) {
          params.set('from', eventDateFrom);
        }
        if (eventDateTo) {
          params.set('to', eventDateTo);
        }
        const query = params.toString();
        navigate(query ? `/search?${query}` : '/search');
      }}
    >
      <CitySuggestInput
        id="hero-search-location"
        name="location"
        label={t('alt.landing.hero.searchLocationLabel')}
        placeholder={t('alt.landing.hero.searchLocationPlaceholder')}
        ariaLabel={t('alt.landing.hero.searchLocationAria')}
        value={locationQuery}
        onChange={setLocationQuery}
      />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
        <label htmlFor="hero-search-date-from" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
          {t('alt.landing.hero.searchDateFromLabel')}
          <input
            id="hero-search-date-from"
            className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
            type="date"
            name="from"
            value={eventDateFrom}
            onChange={(e) => {
              const next = e.target.value;
              setEventDateFrom(next);
              if (!eventDateTo || next > eventDateTo) {
                setEventDateTo(next);
              }
            }}
            aria-label={t('alt.landing.hero.searchDateFromAria')}
          />
        </label>
        <label htmlFor="hero-search-date-to" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
          {t('alt.landing.hero.searchDateToLabel')}
          <input
            id="hero-search-date-to"
            className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
            type="date"
            name="to"
            value={eventDateTo}
            min={eventDateFrom || undefined}
            onChange={(e) => setEventDateTo(e.target.value)}
            aria-label={t('alt.landing.hero.searchDateToAria')}
          />
        </label>
        <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto justify-center">
          {t('alt.landing.hero.searchCta')}
        </Button>
      </div>
    </form>
  );
};

export default AltHeroSearch;
