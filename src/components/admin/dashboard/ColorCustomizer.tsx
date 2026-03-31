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

export const ColorCustomizer = ({ colors, onUpdate }: ColorCustomizerProps) => {
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
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="color-high">High Impact</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color-high"
                type="color"
                value={colors.high}
                onChange={(e) => onUpdate({ high: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={colors.high}
                onChange={(e) => onUpdate({ high: e.target.value })}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="color-medium">Medium Impact</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color-medium"
                type="color"
                value={colors.medium}
                onChange={(e) => onUpdate({ medium: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={colors.medium}
                onChange={(e) => onUpdate({ medium: e.target.value })}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="color-low">Low Impact</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color-low"
                type="color"
                value={colors.low}
                onChange={(e) => onUpdate({ low: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={colors.low}
                onChange={(e) => onUpdate({ low: e.target.value })}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground mb-3">Preview</p>
          <div className="flex gap-3">
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: colors.high }}
            >
              High
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: colors.medium }}
            >
              Medium
            </div>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: colors.low }}
            >
              Low
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
