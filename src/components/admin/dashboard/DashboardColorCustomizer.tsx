import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RotateCcw, Palette } from 'lucide-react';
import type { DashboardColors } from '@/hooks/useDashboardSettings';

interface DashboardColorCustomizerProps {
  colors: DashboardColors;
  onUpdate: (colors: Partial<DashboardColors>) => void;
  onReset: () => void;
}

type ColorFieldKey = 'primary' | 'background' | 'foreground' | 'inputBackground' | 'border' | 'muted' | 'mutedForeground';

const colorFields: { key: ColorFieldKey; label: string; description: string }[] = [
  { key: 'primary', label: 'Accent kleur', description: 'De paarse brand kleur' },
  { key: 'background', label: 'Achtergrond', description: 'Dashboard achtergrond' },
  { key: 'foreground', label: 'Tekst kleur', description: 'Primaire tekstkleur' },
  { key: 'inputBackground', label: 'Invulveld achtergrond', description: 'Achtergrond van inputs' },
  { key: 'border', label: 'Rand kleur', description: 'Borders van elementen' },
  { key: 'muted', label: 'Muted achtergrond', description: 'Secundaire achtergrond' },
  { key: 'mutedForeground', label: 'Muted tekst', description: 'Secundaire tekstkleur' },
];

export const DashboardColorCustomizer = ({ colors, onUpdate, onReset }: DashboardColorCustomizerProps) => {
  const handleColorChange = (key: ColorFieldKey, value: string) => {
    onUpdate({ [key]: value });
  };

  return (
    <Card className="bg-card border-border w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5" />
          Dashboard Kleuren
        </CardTitle>
        <CardDescription>
          Pas de kleuren van je dashboard aan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {colorFields.map(({ key, label, description }) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md border border-border shadow-sm shrink-0"
                  style={{ backgroundColor: colors[key] }}
                />
                <div className="min-w-0">
                  <Label htmlFor={key} className="text-foreground text-sm truncate block">{label}</Label>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="color"
                  id={`${key}-picker`}
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-10 h-8 p-0.5 cursor-pointer shrink-0"
                />
                <Input
                  type="text"
                  id={key}
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="#000000"
                  className="flex-1 font-mono text-xs h-8 min-w-0"
                />
              </div>
            </div>
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={onReset}
          className="mt-4"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset naar standaard
        </Button>
      </CardContent>
    </Card>
  );
};
