import { Clock } from 'lucide-react';
import { useSavedHours } from '@/hooks/useSavedHours';

interface SavedHoursCardProps {
  workflowNames: string[];
}

export const SavedHoursCard = ({ workflowNames }: SavedHoursCardProps) => {
  const { totalHours, isLoading } = useSavedHours(workflowNames);

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3 w-fit">
      <div className="p-2 rounded-lg bg-primary/10">
        <Clock className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Bespaard deze maand</p>
        {isLoading ? (
          <div className="h-6 w-16 bg-muted/30 animate-pulse rounded" />
        ) : (
          <p className="text-lg font-bold text-foreground">
            {totalHours} <span className="text-sm font-normal text-muted-foreground">uur</span>
          </p>
        )}
      </div>
    </div>
  );
};
