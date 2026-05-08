import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CompanyBreakdown } from '@/hooks/useSavedHours';

interface SavedHoursInfoTooltipProps {
  totalHours: number;
  executionCount: number;
  periodStart: string;
  periodEnd: string;
  breakdownByCompany: Record<string, CompanyBreakdown>;
  textColor?: string;
}

const formatPeriod = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const formatDate = (date: Date) => date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  });
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

const formatHours = (hours: number): string => {
  return hours % 1 === 0 ? `${hours}` : hours.toFixed(1);
};

export const SavedHoursInfoTooltip = ({
  totalHours,
  executionCount,
  periodStart,
  periodEnd,
  breakdownByCompany,
  textColor = '#412700',
}: SavedHoursInfoTooltipProps) => {
  const companies = Object.entries(breakdownByCompany).sort(
    ([, a], [, b]) => b.totalHours - a.totalHours
  );
  
  const maxHours = companies.length > 0 ? companies[0][1].totalHours : 0;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 hover:bg-white/10 group"
            onClick={(e) => e.preventDefault()}
            style={{ color: textColor }}
          >
            <Info className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          sideOffset={8}
          className={cn(
            "w-72 p-4 rounded-2xl border-0",
            "bg-[#151515] backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "max-h-[400px] overflow-y-auto"
          )}
        >
          <div className="space-y-4">
            {/* Header */}
            <div>
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1">
                Bespaard deze maand
              </p>
              <p className="text-sm text-white/70">
                Periode: {formatPeriod(periodStart, periodEnd)}
              </p>
            </div>

            {/* Company Breakdown */}
            {companies.length > 0 ? (
              <div className="space-y-4">
                {companies.map(([companyName, companyData]) => {
                  const percentage = maxHours > 0 ? (companyData.totalHours / totalHours) * 100 : 0;
                  const barWidth = maxHours > 0 ? (companyData.totalHours / maxHours) * 100 : 0;
                  const workflows = Object.entries(companyData.workflows).sort(
                    ([, a], [, b]) => b.minutesSaved - a.minutesSaved
                  );

                  return (
                    <div key={companyName} className="space-y-2">
                      {/* Company header */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white uppercase tracking-wide">
                          {companyName}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {formatHours(companyData.totalHours)} uur
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/50 w-10 text-right">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                      
                      {/* Workflow details */}
                      <div className="pl-2 space-y-0.5">
                        {workflows.map(([workflowType, workflowData]) => (
                          <p key={workflowType} className="text-xs text-white/60">
                            • {workflowType}: {formatHours(workflowData.minutesSaved / 60)} uur ({workflowData.executions} runs)
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/50 italic">Geen data beschikbaar</p>
            )}

            {/* Footer with total */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                  Totaal
                </span>
                <span className="text-sm font-bold text-white">
                  {formatHours(totalHours)} uur ({executionCount} executies)
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
