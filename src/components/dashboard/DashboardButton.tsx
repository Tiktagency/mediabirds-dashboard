import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { AutomationInfoTooltip, ImpactLevel, ImpactColors } from './AutomationInfoTooltip';
import type { TileColors } from '@/hooks/useDashboardSettings';

type AutomationStatus = 'active' | 'inactive' | 'testmode';

interface MultipleLastRun {
  label: string;
  time: string | null;
}

interface DashboardButtonProps {
  to?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  disabled?: boolean;
  icon?: LucideIcon;
  description?: string;
  lastRun?: string | null;
  multipleLastRuns?: MultipleLastRun[];
  impact?: ImpactLevel;
  impactColors?: ImpactColors;
  status?: AutomationStatus;
  tileColors?: TileColors;
}

const statusColors: Record<AutomationStatus, string> = {
  active: 'bg-[#1CC866]',
  inactive: 'bg-red-500',
  testmode: 'bg-yellow-500',
};

export const DashboardButton = ({ 
  to, 
  label, 
  variant = 'primary',
  disabled = false,
  icon: Icon,
  description,
  lastRun,
  multipleLastRuns,
  impact,
  impactColors,
  status,
  tileColors,
}: DashboardButtonProps) => {
  const showTooltip = description && impact;
  const isDisabled = disabled || status === 'inactive';
  
  // Determine colors: use tileColors if provided, else fall back to default
  const bgColor = variant === 'muted' ? undefined : tileColors?.background;
  const textColor = variant === 'muted' ? undefined : tileColors?.text;
  const defaultBgClass = variant === 'muted' ? 'bg-muted hover:bg-muted/80' : 'bg-primary hover:bg-primary/90';
  const defaultTextClass = variant === 'muted' ? 'text-muted-foreground' : '';
  
  const buttonContent = (
    <div className="relative w-full">
      {/* Status indicator dot */}
      {status && (
        <div 
          className={`absolute top-2 left-2 w-3 h-3 rounded-full z-10 ${statusColors[status]} shadow-sm`}
          title={status === 'active' ? 'Aan' : status === 'inactive' ? 'Uit' : 'Test'}
        />
      )}
      {showTooltip && (
        <AutomationInfoTooltip
          description={description}
          lastRun={lastRun}
          multipleLastRuns={multipleLastRuns}
          impact={impact}
          impactColors={impactColors}
          textColor={textColor}
        />
      )}
      <Button 
        className={`relative w-full h-32 text-lg font-semibold rounded-xl ${!bgColor ? defaultBgClass : ''} ${!textColor ? defaultTextClass : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={bgColor ? { backgroundColor: bgColor, color: textColor } : undefined}
        size="lg"
        disabled={isDisabled}
      >
        <div className="flex flex-col items-center gap-2">
          {Icon && <Icon className="w-8 h-8" style={textColor ? { color: textColor } : undefined} />}
          {label && <span style={textColor ? { color: textColor } : undefined}>{label}</span>}
        </div>
      </Button>
    </div>
  );

  if (isDisabled || !to) {
    return buttonContent;
  }

  return <Link to={to}>{buttonContent}</Link>;
};
