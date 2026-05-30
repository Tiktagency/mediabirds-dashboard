import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { AutomationStatus } from '@/hooks/useAutomationProgress';

interface AutomationProgressBarProps {
  progress: number;
  status: AutomationStatus;
  elapsed: number;
  expected: number;
  className?: string;
  label?: string;
}

const formatTime = (sec: number) => {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const AutomationProgressBar = ({
  progress,
  status,
  elapsed,
  expected,
  className,
  label,
}: AutomationProgressBarProps) => {
  if (status === 'idle') return null;

  const indicatorClass =
    status === 'success'
      ? '[&>div]:bg-[hsl(142_71%_45%)]'
      : status === 'error'
      ? '[&>div]:bg-destructive'
      : '[&>div]:bg-primary';

  const statusText =
    status === 'success'
      ? 'Voltooid'
      : status === 'error'
      ? 'Mislukt'
      : elapsed > expected
      ? 'Nog bezig, dit duurt langer dan verwacht...'
      : label ?? 'Bezig met verwerken...';

  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-xs text-white/70">
        <span>{statusText}</span>
        <span className="tabular-nums">
          {formatTime(elapsed)} / ~{formatTime(expected)}
        </span>
      </div>
      <Progress
        value={progress}
        className={cn('h-2 bg-white/10 transition-colors', indicatorClass)}
      />
    </div>
  );
};
