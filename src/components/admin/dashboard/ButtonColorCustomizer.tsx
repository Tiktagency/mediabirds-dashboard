import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw, Save } from 'lucide-react';
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
  const [localColors, setLocalColors] = useState<TileColors>(colors);

  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const handleSave = async () => {
    await onUpdate(localColors);
  };

  const handleReset = async () => {
    await onReset();
    setLocalColors(colors);
  };

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
              backgroundColor: localColors.background,
              color: localColors.text,
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
                value={localColors.background}
                onChange={(e) => setLocalColors(prev => ({ ...prev, background: e.target.value }))}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrond"
              />
              <Input
                value={localColors.background}
                onChange={(e) => setLocalColors(prev => ({ ...prev, background: e.target.value }))}
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
                value={localColors.text}
                onChange={(e) => setLocalColors(prev => ({ ...prev, text: e.target.value }))}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Tekst"
              />
              <Input
                value={localColors.text}
                onChange={(e) => setLocalColors(prev => ({ ...prev, text: e.target.value }))}
                className="flex-1 bg-background/50 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 text-xs h-8"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="flex-1 text-xs h-8"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Opslaan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
