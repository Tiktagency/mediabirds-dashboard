import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { AutomationInfoTooltip, ImpactLevel, ImpactColors } from './AutomationInfoTooltip';

type AutomationStatus = 'active' | 'inactive' | 'testmode';

interface DashboardButtonProps {
  to?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  disabled?: boolean;
  icon?: LucideIcon;
  description?: string;
  lastRun?: string | null;
  impact?: ImpactLevel;
  impactColors?: ImpactColors;
  status?: AutomationStatus;
}

const variantClasses = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  accent: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  muted: 'bg-muted hover:bg-muted/80 text-muted-foreground',
};

const statusColors: Record<AutomationStatus, string> = {
  active: 'bg-green-500',
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
  impact,
  impactColors,
  status,
}: DashboardButtonProps) => {
  const showTooltip = description && impact;
  const isDisabled = disabled || status === 'inactive';
  
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
          impact={impact}
          impactColors={impactColors}
        />
      )}
      <Button 
        className={`relative w-full h-32 text-lg font-semibold rounded-xl ${variantClasses[variant]} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        size="lg"
        disabled={isDisabled}
      >
        <div className="flex flex-col items-center gap-2">
          {Icon && <Icon className="w-8 h-8" />}
          {label && <span>{label}</span>}
        </div>
      </Button>
    </div>
  );

  if (isDisabled || !to) {
    return buttonContent;
  }

  return <Link to={to}>{buttonContent}</Link>;
};
