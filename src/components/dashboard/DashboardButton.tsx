import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { AutomationStatus } from '@/hooks/useAutomationStatus';

interface DashboardButtonProps {
  to?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  disabled?: boolean;
  icon?: LucideIcon;
  automationName?: string;
  status?: AutomationStatus;
}

const variantClasses = {
  primary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
  secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
  accent: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  muted: 'bg-muted hover:bg-muted/80 text-muted-foreground',
};

const getStatusColor = (status?: AutomationStatus) => {
  if (!status) return 'bg-muted-foreground/30';
  
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'running':
      return 'bg-yellow-500';
    case 'inactive':
      return 'bg-red-500';
    default:
      return 'bg-muted-foreground/30';
  }
};

export const DashboardButton = ({ 
  to, 
  label, 
  variant = 'primary',
  disabled = false,
  icon: Icon,
  automationName,
  status
}: DashboardButtonProps) => {
  const buttonContent = (
    <Button 
      className={`relative w-full h-32 text-lg font-semibold rounded-xl ${variantClasses[variant]}`}
      size="lg"
      disabled={disabled}
    >
      {/* Status indicator */}
      {automationName && (
        <div className="absolute top-3 left-3">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)} ${status === 'running' ? 'animate-pulse' : ''}`} />
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2">
        {Icon && <Icon className="w-8 h-8" />}
        {label && <span>{label}</span>}
      </div>
    </Button>
  );

  if (disabled || !to) {
    return buttonContent;
  }

  return <Link to={to}>{buttonContent}</Link>;
};
