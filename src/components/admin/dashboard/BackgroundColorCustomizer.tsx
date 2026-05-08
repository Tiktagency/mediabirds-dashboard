import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';

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
            style={{ backgroundColor: color }}
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
                value={color}
                onChange={(e) => onUpdate(e.target.value)}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrondkleur"
              />
              <Input
                value={color}
                onChange={(e) => onUpdate(e.target.value)}
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
          Reset
        </Button>
      </CardContent>
    </Card>
  );
};
