import React, { useState, useRef, useEffect } from 'react';

export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
  label?: string;
  /** Optional formatter for the displayed min/max values. Defaults to `$value`. */
  formatValue?: (value: number, edge: 'min' | 'max') => string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = '',
  label,
  formatValue,
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = (clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = (clientX - rect.left) / rect.width;
    const rawValue = percentage * (max - min) + min;
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
    setIsDragging(type);
    const newValue = getValueFromPosition(e.clientX);
    const clampedValue = Math.max(min, Math.min(max, newValue));

    if (type === 'min') {
      onChange([clampedValue, Math.max(clampedValue, value[1])]);
    } else {
      onChange([Math.min(value[0], clampedValue), clampedValue]);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newValue = getValueFromPosition(e.clientX);
      const clampedValue = Math.max(min, Math.min(max, newValue));

      if (isDragging === 'min') {
        onChange([clampedValue, Math.max(clampedValue, value[1])]);
      } else {
        onChange([Math.min(value[0], clampedValue), clampedValue]);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, value, onChange]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
          <span className="inline-block h-px w-8 bg-gold" aria-hidden />
          {label}
        </label>
      )}
      <div className="relative">
        {/* Value Display */}
        <div className="flex justify-between text-sm text-charcoal/75 mb-2">
          <span>{formatValue ? formatValue(value[0], 'min') : `$${value[0]}`}</span>
          <span>{formatValue ? formatValue(value[1], 'max') : `$${value[1]}`}</span>
        </div>

        {/* Slider Track */}
        <div
          ref={sliderRef}
          className="relative h-2 bg-navy/10 rounded-full cursor-pointer"
        >
          {/* Active Range */}
          <div
            className="absolute h-2 bg-gold rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Min Handle */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[0]}
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gold rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            style={{ left: `calc(${minPercentage}% - 8px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          />

          {/* Max Handle */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value[1]}
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gold rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            style={{ left: `calc(${maxPercentage}% - 8px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
