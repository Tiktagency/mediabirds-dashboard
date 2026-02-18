import { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

const FIELDS = [
  { key: 'alt', label: 'Alternatieve tekst', value: 'Tablet met grafieken en diagrammen...' },
  { key: 'title', label: 'Titel', value: 'Tablet met data-analyse interface' },
  { key: 'caption', label: 'Bijschrift', value: 'Tablet toont geavanceerde grafieken...' },
  { key: 'desc', label: 'Beschrijving', value: 'Afbeelding van een tablet met diverse...' },
];

interface AltTextAnimationProps {
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

const AltTextAnimation = ({ isAnimating, onAnimationComplete }: AltTextAnimationProps) => {
  const [filledFields, setFilledFields] = useState<string[]>([]);

  useEffect(() => {
    if (!isAnimating) return;

    setFilledFields([]);
    const timeouts: NodeJS.Timeout[] = [];

    FIELDS.forEach((field, i) => {
      timeouts.push(
        setTimeout(() => {
          setFilledFields(prev => [...prev, field.key]);
          if (i === FIELDS.length - 1) {
            setTimeout(onAnimationComplete, 400);
          }
        }, (i + 1) * 500)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isAnimating, onAnimationComplete]);

  const resetAnimation = useCallback(() => {
    setFilledFields([]);
  }, []);

  // Expose reset via parent if needed
  useEffect(() => {
    if (!isAnimating && filledFields.length > 0) {
      const t = setTimeout(() => setFilledFields([]), 3000);
      return () => clearTimeout(t);
    }
  }, [isAnimating, filledFields.length]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full max-w-2xl">
      {/* Left panel - Before */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1 w-full min-w-0">
        <div className="space-y-3">
          {FIELDS.map((field) => {
            const isFilled = filledFields.includes(field.key);
            return (
              <div key={field.key} className="space-y-1">
                <label className="text-xs font-medium text-gray-600">{field.label}</label>
                <div className="relative h-8 rounded border border-gray-200 bg-gray-50 overflow-hidden px-2 flex items-center">
                  {isFilled && (
                    <span className="text-xs text-gray-800 animate-[field-fill_0.4s_ease-out_forwards]">
                      {field.value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow */}
      <div className={`flex-shrink-0 transition-all duration-300 ${isAnimating ? 'text-primary scale-110' : 'text-muted-foreground'}`}>
        <div className={`${isAnimating ? 'animate-[arrow-pulse_1s_ease-in-out_infinite]' : ''}`}>
          <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 rotate-90 sm:rotate-0" />
        </div>
      </div>

      {/* Right panel - After (always filled) */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex-1 w-full min-w-0">
        <div className="space-y-3">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-xs font-medium text-gray-600">{field.label}</label>
              <div className="h-8 rounded border border-gray-200 bg-gray-50 px-2 flex items-center">
                <span className="text-xs text-gray-800 truncate">{field.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AltTextAnimation;
