import { Clock } from 'lucide-react';
import { useSavedHours } from '@/hooks/useSavedHours';

interface SavedHoursTileProps {
  workflowNames: string[];
}

export const SavedHoursTile = ({ workflowNames }: SavedHoursTileProps) => {
  const { totalHours, isLoading } = useSavedHours(workflowNames);

  return (
    <div className="h-32 rounded-xl bg-white border border-[#cfddd0]/30 flex flex-col items-center justify-center gap-2 p-4">
      <Clock className="w-6 h-6 text-[#002C1F]" />
      <span className="text-xs text-[#002C1F] font-medium">Bespaard deze maand</span>
      {isLoading ? (
        <div className="animate-pulse bg-[#cfddd0]/30 h-8 w-16 rounded" />
      ) : (
        <span className="text-2xl font-bold text-[#002C1F]">{totalHours} uur</span>
      )}
    </div>
  );
};
