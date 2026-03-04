import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

const PADDING = 12;
const BUBBLE_OFFSET = 16;
const BUBBLE_MAX_WIDTH = 400;

export interface OnboardingStepConfig {
  key: string;
  targetId: string;
  titleKey: string;
  messageKey: string;
}

export interface OnboardingTourProps {
  steps: OnboardingStepConfig[];
  currentStep: number;
  targetRefs: Record<string, React.RefObject<HTMLElement | null>>;
  onNext: () => void;
  onSkip: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

type BubblePlacement = 'top' | 'bottom' | 'left' | 'right';

function getBubblePlacement(
  targetRect: TargetRect,
  bubbleWidth: number,
  bubbleHeight: number
): BubblePlacement {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const spaceAbove = targetRect.top;
  const spaceBelow = viewportHeight - (targetRect.top + targetRect.height);
  const spaceLeft = targetRect.left;
  const spaceRight = viewportWidth - (targetRect.left + targetRect.width);

  if (spaceBelow >= bubbleHeight + BUBBLE_OFFSET) return 'bottom';
  if (spaceAbove >= bubbleHeight + BUBBLE_OFFSET) return 'top';
  if (spaceRight >= bubbleWidth + BUBBLE_OFFSET) return 'right';
  if (spaceLeft >= bubbleWidth + BUBBLE_OFFSET) return 'left';
  return 'bottom';
}

function getBubblePosition(
  targetRect: TargetRect,
  placement: BubblePlacement,
  bubbleWidth: number,
  bubbleHeight: number
): { top: number; left: number } {
  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;

  let top: number;
  let left: number;

  switch (placement) {
    case 'bottom':
      top = targetRect.top + targetRect.height + BUBBLE_OFFSET;
      left = Math.max(PADDING, Math.min(centerX - bubbleWidth / 2, window.innerWidth - bubbleWidth - PADDING));
      break;
    case 'top':
      top = targetRect.top - bubbleHeight - BUBBLE_OFFSET;
      left = Math.max(PADDING, Math.min(centerX - bubbleWidth / 2, window.innerWidth - bubbleWidth - PADDING));
      break;
    case 'right':
      top = Math.max(PADDING, Math.min(centerY - bubbleHeight / 2, window.innerHeight - bubbleHeight - PADDING));
      left = targetRect.left + targetRect.width + BUBBLE_OFFSET;
      break;
    case 'left':
      top = Math.max(PADDING, Math.min(centerY - bubbleHeight / 2, window.innerHeight - bubbleHeight - PADDING));
      left = targetRect.left - bubbleWidth - BUBBLE_OFFSET;
      break;
    default:
      top = targetRect.top + targetRect.height + BUBBLE_OFFSET;
      left = centerX - bubbleWidth / 2;
  }

  return { top, left };
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  currentStep,
  targetRefs,
  onNext,
  onSkip,
}) => {
  const { t } = useTranslation();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [bubbleSize, setBubbleSize] = useState({ width: BUBBLE_MAX_WIDTH, height: 120 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const targetRef = step ? targetRefs[step.targetId] : null;

  const updateRect = useCallback(() => {
    const el = targetRef?.current;
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [targetRef]);

  useEffect(() => {
    if (!step || !targetRef) return;
    const el = targetRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, step, targetRef]);

  useEffect(() => {
    updateRect();
    const handleUpdate = () => updateRect();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [currentStep, updateRect, targetRef]);

  useEffect(() => {
    if (!targetRect || !bubbleRef.current) return;
    const br = bubbleRef.current.getBoundingClientRect();
    setBubbleSize({ width: br.width, height: br.height });
  }, [targetRect]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onSkip]);

  if (!step) return null;

  const placement = targetRect
    ? getBubblePlacement(targetRect, bubbleSize.width, bubbleSize.height)
    : 'bottom';
  const bubblePos = targetRect
    ? getBubblePosition(targetRect, placement, bubbleSize.width, bubbleSize.height)
    : { top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - BUBBLE_MAX_WIDTH / 2 };

  const highlightRect = targetRect;

  const overlay = (
    <div className="fixed inset-0 z-[100]" aria-hidden="false">
      {/* Dim overlay - pointer-events none so only bubble is clickable */}
      <div
        className="absolute inset-0 bg-navy/20"
        style={{ pointerEvents: 'none' }}
      />
      {/* Highlight ring - positioned over target */}
      {highlightRect && (
        <div
          className="absolute rounded-xl pointer-events-none onboarding-highlight"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}
      {/* Instruction bubble - clickable */}
      <div
        ref={bubbleRef}
        role="dialog"
        aria-live="polite"
        aria-label={t(step.titleKey)}
        className="absolute z-10 bg-white rounded-xl shadow-xl border border-gray-200 p-6 max-w-[400px]"
        style={{
          top: bubblePos.top,
          left: bubblePos.left,
          width: BUBBLE_MAX_WIDTH,
          pointerEvents: 'auto',
        }}
      >
        <h3 className="text-base font-semibold text-navy mb-2">
          {t(step.titleKey)}
        </h3>
        <p className="text-base text-charcoal mb-4 leading-relaxed">
          {t(step.messageKey)}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-charcoal">
            {t('onboarding.stepIndicator', {
              current: currentStep + 1,
              total: steps.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-base text-charcoal hover:text-navy underline focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded px-1"
            >
              {t('onboarding.skip')}
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={onNext}
            >
              {currentStep === steps.length - 1
                ? t('onboarding.done')
                : t('onboarding.next')}
            </Button>
          </div>
        </div>
        <div className="flex gap-1 mt-2 justify-center">
          {steps.map((_, index) => (
            <span
              key={steps[index].key}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === currentStep ? 'bg-gold' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default OnboardingTour;
