import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { AutomationInfoTooltip, ImpactLevel } from './AutomationInfoTooltip';

interface DashboardButtonProps {
  to?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  disabled?: boolean;
  icon?: LucideIcon;
  description?: string;
  lastRun?: string | null;
  impact?: ImpactLevel;
}

const variantClasses = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  accent: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  muted: 'bg-muted hover:bg-muted/80 text-muted-foreground',
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
}: DashboardButtonProps) => {
  const showTooltip = description && impact;
  const buttonContent = (
    <div className="relative w-full">
      {showTooltip && (
        <AutomationInfoTooltip
          description={description}
          lastRun={lastRun}
          impact={impact}
        />
      )}
      <Button 
        className={`relative w-full h-32 text-lg font-semibold rounded-xl ${variantClasses[variant]}`}
        size="lg"
        disabled={disabled}
      >
        <div className="flex flex-col items-center gap-2">
          {Icon && <Icon className="w-8 h-8" />}
          {label && <span>{label}</span>}
        </div>
      </Button>
    </div>
  );

  if (disabled || !to) {
    return buttonContent;
  }

  return <Link to={to}>{buttonContent}</Link>;
};
