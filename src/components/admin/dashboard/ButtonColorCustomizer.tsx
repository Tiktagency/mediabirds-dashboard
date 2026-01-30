import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';
import type { TileColors } from '@/hooks/useDashboardSettings';

interface ButtonColorCustomizerProps {
  colors: TileColors;
  onUpdate: (colors: { background?: string; text?: string }) => Promise<void>;
  onReset: () => Promise<void>;
}

export const ButtonColorCustomizer = ({ 
  colors, 
  onUpdate, 
  onReset 
}: ButtonColorCustomizerProps) => {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Knopkleuren
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de kleuren aan van je knoppen.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <button 
            className="px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
            style={{ 
              backgroundColor: colors.background,
              color: colors.text,
            }}
          >
            Voorbeeld knop
          </button>
        </div>

        {/* Color Inputs */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Achtergrond
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.background}
                onChange={(e) => onUpdate({ background: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrond"
              />
              <Input
                value={colors.background}
                onChange={(e) => onUpdate({ background: e.target.value })}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Tekst
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Tekst"
              />
              <Input
                value={colors.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full text-xs h-8"
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          Reset naar standaard
        </Button>
      </CardContent>
    </Card>
  );
};
