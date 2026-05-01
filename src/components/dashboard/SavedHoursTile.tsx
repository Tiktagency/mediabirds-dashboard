import { Clock } from 'lucide-react';
import { useSavedHours } from '@/hooks/useSavedHours';

interface SavedHoursTileProps {
  workflowNames: string[];
}

export const SavedHoursTile = ({ workflowNames }: SavedHoursTileProps) => {
  const { totalHours, isLoading } = useSavedHours(workflowNames);

  return (
    <div className="h-32 rounded-xl bg-pink-400/20 border border-pink-400/30 flex flex-col items-center justify-center gap-2 p-4">
      <Clock className="w-6 h-6 text-pink-400" />
      <span className="text-xs text-pink-300/80 font-medium">Bespaard deze maand</span>
      {isLoading ? (
        <div className="animate-pulse bg-pink-400/30 h-8 w-16 rounded" />
      ) : (
        <span className="text-2xl font-bold text-pink-200">{totalHours} uur</span>
      )}
    </div>
  );
};
