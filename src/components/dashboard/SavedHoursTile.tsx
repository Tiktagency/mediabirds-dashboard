import { Clock } from 'lucide-react';
import { useSavedHours } from '@/hooks/useSavedHours';
import type { TileColors } from '@/hooks/useDashboardSettings';

interface SavedHoursTileProps {
  workflowNames: string[];
  tileColors?: TileColors;
}

const DEFAULT_SAVED_HOURS_COLORS: TileColors = {
  background: '#f2eadc',
  text: '#412700',
};

export const SavedHoursTile = ({ workflowNames, tileColors }: SavedHoursTileProps) => {
  const { totalHours, isLoading } = useSavedHours(workflowNames);
  const colors = tileColors || DEFAULT_SAVED_HOURS_COLORS;

  return (
    <div 
      className="h-32 rounded-xl border flex flex-col items-center justify-center gap-2 p-4"
      style={{ 
        backgroundColor: colors.background,
        borderColor: `${colors.background}40`,
      }}
    >
      <Clock className="w-6 h-6" style={{ color: colors.text }} />
      <span className="text-xs font-medium" style={{ color: colors.text }}>Bespaard deze maand</span>
      {isLoading ? (
        <div className="animate-pulse h-8 w-16 rounded" style={{ backgroundColor: `${colors.text}20` }} />
      ) : (
        <span className="text-2xl font-bold" style={{ color: colors.text }}>{totalHours} uur</span>
      )}
    </div>
  );
};
