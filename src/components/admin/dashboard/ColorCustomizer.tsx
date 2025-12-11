import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

interface ColorCustomizerProps {
  colors: {
    high: string;
    medium: string;
    low: string;
  };
  onUpdate: (colors: { high?: string; medium?: string; low?: string }) => Promise<void>;
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ColorCustomizer = ({ colors, onUpdate }: ColorCustomizerProps) => {
  const getTagStyle = (color: string) => ({
    backgroundColor: hexToRgba(color, 0.2),
    color: color,
    boxShadow: `0 0 8px ${hexToRgba(color, 0.4)}`,
  });

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Impact Kleuren
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de kleuren aan voor de verschillende impact niveaus.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="color-high">High Impact</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-high"
              type="color"
              value={colors.high}
              onChange={(e) => onUpdate({ high: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={colors.high}
              onChange={(e) => onUpdate({ high: e.target.value })}
              className="flex-1 bg-background/50 font-mono text-sm"
            />
            <span
              className="w-20 text-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0"
              style={getTagStyle(colors.high)}
            >
              High
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-medium">Medium Impact</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-medium"
              type="color"
              value={colors.medium}
              onChange={(e) => onUpdate({ medium: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={colors.medium}
              onChange={(e) => onUpdate({ medium: e.target.value })}
              className="flex-1 bg-background/50 font-mono text-sm"
            />
            <span
              className="w-20 text-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0"
              style={getTagStyle(colors.medium)}
            >
              Medium
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-low">Low Impact</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-low"
              type="color"
              value={colors.low}
              onChange={(e) => onUpdate({ low: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={colors.low}
              onChange={(e) => onUpdate({ low: e.target.value })}
              className="flex-1 bg-background/50 font-mono text-sm"
            />
            <span
              className="w-20 text-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shrink-0"
              style={getTagStyle(colors.low)}
            >
              Low
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
