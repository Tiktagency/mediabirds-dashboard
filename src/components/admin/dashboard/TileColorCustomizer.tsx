import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Clock, RotateCcw } from 'lucide-react';
import type { TileColors } from '@/hooks/useDashboardSettings';

interface TileColorCustomizerProps {
  colors: TileColors;
  onUpdate: (colors: { background?: string; text?: string }) => Promise<void>;
  onReset: () => Promise<void>;
}

export const TileColorCustomizer = ({ colors, onUpdate, onReset }: TileColorCustomizerProps) => {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Tile Kleuren
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de kleuren aan van je dashboard tiles.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Preview</Label>
          <div 
            className="h-20 rounded-xl border flex flex-col items-center justify-center gap-2 transition-colors"
            style={{ 
              backgroundColor: colors.background,
              borderColor: `${colors.background}40`,
            }}
          >
            <Clock className="w-5 h-5" style={{ color: colors.text }} />
            <span className="text-xs font-medium" style={{ color: colors.text }}>
              Bespaard deze maand
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-background">Achtergrond</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-background"
              type="color"
              value={colors.background}
              onChange={(e) => onUpdate({ background: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={colors.background}
              onChange={(e) => onUpdate({ background: e.target.value })}
              className="flex-1 bg-background/50 font-mono text-sm"
            />
            <div 
              className="w-10 h-10 rounded-lg border border-border/30 shrink-0"
              style={{ backgroundColor: colors.background }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-text">Tekst</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-text"
              type="color"
              value={colors.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer shrink-0"
            />
            <Input
              value={colors.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="flex-1 bg-background/50 font-mono text-sm"
            />
            <div 
              className="w-10 h-10 rounded-lg border border-border/30 shrink-0 flex items-center justify-center"
              style={{ backgroundColor: colors.background }}
            >
              <span className="text-sm font-bold" style={{ color: colors.text }}>Aa</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full mt-2"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset naar standaard
        </Button>
      </CardContent>
    </Card>
  );
};
