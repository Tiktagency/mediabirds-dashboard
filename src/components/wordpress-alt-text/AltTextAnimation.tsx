import { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (!isAnimating && filledFields.length > 0) {
      const t = setTimeout(() => setFilledFields([]), 3000);
      return () => clearTimeout(t);
    }
  }, [isAnimating, filledFields.length]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 w-full h-full">
      <div className="flex flex-col justify-between flex-1">
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
  );
};

export default AltTextAnimation;
