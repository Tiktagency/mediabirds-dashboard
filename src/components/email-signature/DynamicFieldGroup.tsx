import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface DynamicFieldGroupProps {
  label: string;
  required?: boolean;
  primaryValue: string;
  primaryPlaceholder: string;
  extraValues: string[];
  onPrimaryChange: (value: string) => void;
  onExtraChange: (values: string[]) => void;
  inputType?: 'text' | 'email' | 'tel';
  error?: string;
  extraError?: string;
  maxExtra?: number;
}

export const DynamicFieldGroup = ({
  label,
  required = false,
  primaryValue,
  primaryPlaceholder,
  extraValues,
  onPrimaryChange,
  onExtraChange,
  inputType = 'text',
  error,
  extraError,
  maxExtra = 1,
}: DynamicFieldGroupProps) => {
  const canAddMore = extraValues.length < maxExtra;

  const addExtra = () => {
    if (canAddMore) {
      onExtraChange([...extraValues, '']);
    }
  };

  const removeExtra = (index: number) => {
    onExtraChange(extraValues.filter((_, i) => i !== index));
  };

  const updateExtra = (index: number, value: string) => {
    const updated = [...extraValues];
    updated[index] = value;
    onExtraChange(updated);
  };

  return (
    <div className="space-y-2">
      <Label className="text-white">
        {label} {required && '*'}
      </Label>
      
      {/* Primary field */}
      <Input
        type={inputType}
        value={primaryValue}
        onChange={(e) => onPrimaryChange(e.target.value)}
        className="bg-white/10 border-white/20 text-white"
        placeholder={primaryPlaceholder}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Extra fields */}
      {extraValues.map((value, index) => (
        <div key={index} className="flex items-center gap-2 mt-2">
          <Input
            type={inputType}
            value={value}
            onChange={(e) => updateExtra(index, e.target.value)}
            className="flex-1 bg-white/10 border-white/20 text-white"
            placeholder={primaryPlaceholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeExtra(index)}
            className="text-white/50 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {extraError && <p className="text-sm text-red-400">{extraError}</p>}

      {/* Add button */}
      {canAddMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addExtra}
          className="text-white/50 hover:text-white hover:bg-white/10 mt-1 h-8 px-2"
        >
          <Plus className="w-4 h-4 mr-1" />
          Extra {label.toLowerCase().replace(' (optioneel)', '').replace(' *', '')} toevoegen
        </Button>
      )}
    </div>
  );
};
