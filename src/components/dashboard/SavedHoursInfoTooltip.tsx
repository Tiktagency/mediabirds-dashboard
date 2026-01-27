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
    year: 'numeric',
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
            "w-[420px] p-5 rounded-2xl border-0",
            "bg-[#151515] backdrop-blur-xl",
            "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "max-h-[520px] overflow-y-auto"
          )}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="pb-3 border-b border-white/10">
              <p className="text-sm font-semibold text-white uppercase tracking-wider mb-1">
                Bespaard deze maand
              </p>
              <p className="text-sm text-white/60">
                {formatPeriod(periodStart, periodEnd)}
              </p>
            </div>

            {/* Company Breakdown */}
            {companies.length > 0 ? (
              <div className="space-y-5">
                {companies.map(([companyName, companyData], index) => {
                  const percentage = totalHours > 0 ? (companyData.totalHours / totalHours) * 100 : 0;
                  const barWidth = maxHours > 0 ? (companyData.totalHours / maxHours) * 100 : 0;
                  const workflows = Object.entries(companyData.workflows).sort(
                    ([, a], [, b]) => b.minutesSaved - a.minutesSaved
                  );

                  return (
                    <div key={companyName}>
                      {/* Divider between companies (except first) */}
                      {index > 0 && <div className="border-t border-white/5 -mt-2 mb-4" />}
                      
                      <div className="space-y-3">
                        {/* Company header with hours */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-white uppercase tracking-wide">
                            {companyName}
                          </span>
                          <span className="text-lg font-bold text-white">
                            {formatHours(companyData.totalHours)} <span className="text-sm font-normal text-white/60">uur</span>
                          </span>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-white/50 w-10 text-right">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        
                        {/* Workflow details as a mini table */}
                        {workflows.length > 0 ? (
                          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5 pl-1 pt-1">
                            {workflows.map(([workflowType, workflowData]) => (
                              <>
                                <span key={`${workflowType}-name`} className="text-xs text-white/60">
                                  {workflowType}
                                </span>
                                <span key={`${workflowType}-hours`} className="text-xs text-white/80 font-medium text-right tabular-nums">
                                  {formatHours(workflowData.minutesSaved / 60)} uur
                                </span>
                                <span key={`${workflowType}-runs`} className="text-xs text-white/40 text-right tabular-nums">
                                  ({workflowData.executions} runs)
                                </span>
                              </>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic pl-1">
                            Nog geen workflows geconfigureerd
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/50 italic">Geen data beschikbaar</p>
            )}

            {/* Footer with total */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Totaal
                </span>
                <span className="text-base font-bold text-white">
                  {formatHours(totalHours)} uur <span className="text-sm font-normal text-white/50">({executionCount} executies)</span>
                </span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
