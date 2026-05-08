import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw, Save } from 'lucide-react';

interface BackgroundColorCustomizerProps {
  color: string;
  onUpdate: (color: string) => Promise<void>;
  onReset: () => Promise<void>;
}

export const BackgroundColorCustomizer = ({ 
  color, 
  onUpdate, 
  onReset 
}: BackgroundColorCustomizerProps) => {
  const [localColor, setLocalColor] = useState(color);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleSave = async () => {
    await onUpdate(localColor);
  };

  const handleReset = async () => {
    await onReset();
    setLocalColor(color);
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Achtergrondkleur
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de achtergrondkleur aan van alle pagina's.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex justify-center">
          <div 
            className="w-24 h-16 rounded-md border border-border/50"
            style={{ backgroundColor: localColor }}
          />
        </div>

        {/* Color Input */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Achtergrond
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrondkleur"
              />
              <Input
                value={localColor}
                onChange={(e) => setLocalColor(e.target.value)}
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
