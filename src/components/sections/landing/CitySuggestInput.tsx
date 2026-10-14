import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { getUyCities, type UyCity } from '../../../data/uyCityUtils';

const UY_CITIES_MAX_SUGGESTIONS = 10;
const uyCities = getUyCities();

export interface CitySuggestInputProps {
  id: string;
  label: string;
  placeholder: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

const CitySuggestInput: React.FC<CitySuggestInputProps> = ({
  id,
  label,
  placeholder,
  ariaLabel,
  value,
  onChange,
  name = 'city',
}) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const filteredCities = useMemo(() => {
    const q = value.trim().toLowerCase();
    const pool = q
      ? uyCities.filter((c) => c.name.toLowerCase().includes(q))
      : uyCities.filter((c) => c.zoom === '9');
    return pool.slice(0, UY_CITIES_MAX_SUGGESTIONS);
  }, [value]);

  const handleSelectCity = useCallback(
    (city: UyCity) => {
      onChange(city.name);
      setShowSuggestions(false);
      setActiveIndex(-1);
    },
    [onChange],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredCities.length === 0) {
      if (e.key === 'ArrowDown' && filteredCities.length > 0) {
        setShowSuggestions(true);
        setActiveIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredCities.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? filteredCities.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const city = filteredCities[activeIndex];
      if (city) handleSelectCity(city);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const isOpen = showSuggestions && filteredCities.length > 0;

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
      {label}
      <div ref={containerRef} className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40 pointer-events-none" aria-hidden />
        <input
          id={id}
          className="w-full border border-navy/20 rounded-xl bg-white text-navy text-sm pl-9 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          role="combobox"
          autoComplete="off"
        />
        {isOpen && (
          <ul
            id={listboxId}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-navy/15 rounded-xl shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
          >
            {filteredCities.map((city, index) => (
              <li
                key={city.name}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`px-4 py-2.5 cursor-pointer text-sm text-navy border-b border-gray-100 last:border-0 ${
                  index === activeIndex ? 'bg-warm-gray' : 'hover:bg-gray-100'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectCity(city);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {city.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
};

export default CitySuggestInput;
