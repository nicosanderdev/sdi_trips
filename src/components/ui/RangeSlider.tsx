import React, { useState, useRef, useEffect } from 'react';

export interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  className?: string;
  label?: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  className = '',
  label,
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
        <label className="block text-sm font-medium text-navy">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Value Display */}
        <div className="flex justify-between text-sm text-charcoal mb-2">
          <span>${value[0]}</span>
          <span>${value[1]}</span>
        </div>

        {/* Slider Track */}
        <div
          ref={sliderRef}
          className="relative h-2 bg-warm-gray rounded-full cursor-pointer"
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
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gold rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `calc(${minPercentage}% - 8px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          />

          {/* Max Handle */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gold rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `calc(${maxPercentage}% - 8px)` }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
