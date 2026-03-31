import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

interface ThemeSwitchProps {
  theme: 'dark' | 'light';
  onUpdate: (theme: 'dark' | 'light') => Promise<void>;
}

export const ThemeSwitch = ({ theme, onUpdate }: ThemeSwitchProps) => {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          Thema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-yellow-500" />
            <Label className="font-medium">Licht</Label>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => onUpdate(checked ? 'dark' : 'light')}
          />
          <div className="flex items-center gap-3">
            <Label className="font-medium">Donker</Label>
            <Moon className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Dit is een persoonlijke instelling die alleen voor jouw account geldt.
        </p>
      </CardContent>
    </Card>
  );
};
