import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface DashboardButtonProps {
  to?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
  disabled?: boolean;
  icon?: LucideIcon;
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
  icon: Icon
}: DashboardButtonProps) => {
  const buttonContent = (
    <Button 
      className={`w-full h-32 text-lg font-semibold rounded-xl ${variantClasses[variant]}`}
      size="lg"
      disabled={disabled}
    >
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
