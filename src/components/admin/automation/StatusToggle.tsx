import { cn } from '@/lib/utils';
import type { AutomationStatusType } from '@/hooks/useAutomationSettings';

interface StatusToggleProps {
  status: AutomationStatusType;
  onChange: (status: AutomationStatusType) => void;
}

const statusConfig: Record<AutomationStatusType, { label: string; color: string }> = {
  active: { label: 'Aan', color: 'bg-green-500' },
  inactive: { label: 'Uit', color: 'bg-red-500' },
  testmode: { label: 'Test', color: 'bg-yellow-500' },
};

export const StatusToggle = ({ status, onChange }: StatusToggleProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="flex items-center bg-background/50 rounded-lg p-1 gap-1"
      onClick={handleClick}
    >
      {(Object.keys(statusConfig) as AutomationStatusType[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-md transition-all',
            status === key
              ? `${statusConfig[key].color} text-white`
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          {statusConfig[key].label}
        </button>
      ))}
    </div>
  );
};
