import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, Clock, RotateCcw, CalendarDays } from 'lucide-react';
import type { TileColors } from '@/hooks/useDashboardSettings';

interface TileColorCustomizerProps {
  colors: TileColors;
  savedHoursColors: TileColors;
  onUpdate: (colors: { background?: string; text?: string }) => Promise<void>;
  onUpdateSavedHours: (colors: { background?: string; text?: string }) => Promise<void>;
  onReset: () => Promise<void>;
  onResetSavedHours: () => Promise<void>;
}

export const TileColorCustomizer = ({ 
  colors, 
  savedHoursColors,
  onUpdate, 
  onUpdateSavedHours,
  onReset,
  onResetSavedHours 
}: TileColorCustomizerProps) => {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-4 h-4" />
          Tile Kleuren
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de kleuren aan van je dashboard tiles.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side-by-side Previews */}
        <div className="grid grid-cols-2 gap-3">
          <div 
            className="h-14 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ 
              backgroundColor: savedHoursColors.background,
              borderColor: `${savedHoursColors.background}40`,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: savedHoursColors.text }} />
            <span className="text-[10px] font-medium" style={{ color: savedHoursColors.text }}>
              Bespaard
            </span>
          </div>
          <div 
            className="h-14 rounded-lg border flex flex-col items-center justify-center gap-1 transition-colors"
            style={{ 
              backgroundColor: colors.background,
              borderColor: `${colors.background}40`,
            }}
          >
            <CalendarDays className="w-4 h-4" style={{ color: colors.text }} />
            <span className="text-[10px] font-medium" style={{ color: colors.text }}>
              Overige
            </span>
          </div>
        </div>

        {/* Color Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Saved Hours Colors */}
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Bespaard deze maand
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={savedHoursColors.background}
                onChange={(e) => onUpdateSavedHours({ background: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrond"
              />
              <div 
                className="w-8 h-8 rounded border border-border/30 shrink-0"
                style={{ backgroundColor: savedHoursColors.background }}
              />
              <span className="text-[10px] text-muted-foreground">BG</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={savedHoursColors.text}
                onChange={(e) => onUpdateSavedHours({ text: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Tekst"
              />
              <div 
                className="w-8 h-8 rounded border border-border/30 shrink-0 flex items-center justify-center"
                style={{ backgroundColor: savedHoursColors.background }}
              >
                <span className="text-xs font-bold" style={{ color: savedHoursColors.text }}>A</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Tekst</span>
            </div>
          </div>

          {/* Other Tiles Colors */}
          <div className="space-y-2">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Overige tiles
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.background}
                onChange={(e) => onUpdate({ background: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Achtergrond"
              />
              <div 
                className="w-8 h-8 rounded border border-border/30 shrink-0"
                style={{ backgroundColor: colors.background }}
              />
              <span className="text-[10px] text-muted-foreground">BG</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={colors.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                className="w-8 h-8 p-0.5 cursor-pointer shrink-0"
                title="Tekst"
              />
              <div 
                className="w-8 h-8 rounded border border-border/30 shrink-0 flex items-center justify-center"
                style={{ backgroundColor: colors.background }}
              >
                <span className="text-xs font-bold" style={{ color: colors.text }}>A</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Tekst</span>
            </div>
          </div>
        </div>

        {/* Reset Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetSavedHours}
            className="text-xs h-8"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
