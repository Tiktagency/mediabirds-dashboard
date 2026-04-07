import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

interface ThemeSwitchProps {
  theme: 'dark' | 'light';
  onUpdate: (theme: 'dark' | 'light') => Promise<void>;
}

export const ThemeSwitch = ({ theme, onUpdate }: ThemeSwitchProps) => {
  const { setTheme } = useTheme();

  // Sync theme with next-themes when settings change
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  const handleThemeChange = async (isDark: boolean) => {
    const newTheme = isDark ? 'dark' : 'light';
    setTheme(newTheme);
    await onUpdate(newTheme);
  };

  return (
    <Card className="bg-card/50 border-border/30 opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          Thema
          <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            binnenkort beschikbaar!
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30 pointer-events-none">
          <div className="flex items-center gap-3">
            <Sun className="w-5 h-5 text-yellow-500" />
            <Label className="font-medium">Licht</Label>
          </div>
          <Switch
            checked={theme === 'dark'}
            disabled
          />
          <div className="flex items-center gap-3">
            <Label className="font-medium">Donker</Label>
            <Moon className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
