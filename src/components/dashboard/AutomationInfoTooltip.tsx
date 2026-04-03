import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export type ImpactLevel = 'high' | 'medium' | 'low';

export interface ImpactColors {
  high: string;
  medium: string;
  low: string;
}

interface AutomationInfoTooltipProps {
  description: string;
  lastRun?: string | null;
  impact: ImpactLevel;
  impactColors?: ImpactColors;
}

const defaultImpactColors: ImpactColors = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#6b7280',
};

const impactLabels: Record<ImpactLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const formatLastRun = (lastRun?: string | null): string => {
  if (!lastRun) return 'Nooit';
  
  const date = new Date(lastRun);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Zojuist';
  if (diffMins === 1) return '1 minuut geleden';
  if (diffMins < 60) return `${diffMins} minuten geleden`;
  if (diffHours === 1) return '1 uur geleden';
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return '1 dag geleden';
  if (diffDays < 7) return `${diffDays} dagen geleden`;
  
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const AutomationInfoTooltip = ({
  description,
  lastRun,
  impact,
  impactColors = defaultImpactColors,
}: AutomationInfoTooltipProps) => {
  const color = impactColors[impact];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 hover:bg-white/10 group"
            onClick={(e) => e.preventDefault()}
          >
            <Info className="w-4 h-4 text-white/60 group-hover:text-white/100 transition-opacity duration-200" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          sideOffset={8}
          className={cn(
            "w-64 p-4 rounded-2xl border-0",
            "bg-[#151515] backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          <div className="space-y-3">
            {/* Description */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-white/90 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Laatste succesvol uitgevoerd */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                Laatste succesvol uitgevoerd
              </p>
              <p className="text-sm text-white/80">
                {formatLastRun(lastRun)}
              </p>
            </div>

            {/* Impact Badge */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Impact
              </p>
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: hexToRgba(color, 0.2),
                  color: color,
                  boxShadow: `0 0 8px ${hexToRgba(color, 0.4)}`,
                }}
              >
                {impactLabels[impact]}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
