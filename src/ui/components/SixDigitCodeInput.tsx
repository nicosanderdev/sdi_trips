import React, { useEffect, useMemo, useRef } from 'react';

const CODE_LENGTH = 6;

export interface SixDigitCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  autoFocus?: boolean;
}

const SixDigitCodeInput: React.FC<SixDigitCodeInputProps> = ({
  value,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
  autoFocus = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = useMemo(() => {
    const normalized = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
    return Array.from({ length: CODE_LENGTH }, (_, i) => normalized[i] ?? '');
  }, [value]);

  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return () => window.clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  const updateCode = (nextDigits: string[]) => {
    onChange(nextDigits.join('').slice(0, CODE_LENGTH));
  };

  const handleInputChange = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;

    const digit = raw.length > 1 ? raw.slice(-1) : raw;
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    updateCode(nextDigits);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInputKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    const nextDigits = Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? '');
    updateCode(nextDigits);

    const focusIndex = Math.min(pasted.length, CODE_LENGTH) - 1;
    if (focusIndex >= 0) {
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={className}
      onPaste={handlePaste}
    >
      <span className="sr-only">{ariaLabel}</span>
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(index, e)}
            disabled={disabled}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            aria-label={`${ariaLabel} ${index + 1} / ${CODE_LENGTH}`}
            className="h-11 w-10 rounded-2xl border border-warm-gray bg-white text-center text-lg font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-gray-100 disabled:text-gray-500 sm:h-12 sm:w-11"
          />
        ))}
      </div>
    </div>
  );
};

export default SixDigitCodeInput;
