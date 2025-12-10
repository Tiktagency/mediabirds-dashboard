import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import type { LogSettings, LogLevel } from '@/hooks/useLogSettings';

interface LogSettingsFormProps {
  settings: LogSettings | null;
  onUpdate: (updates: Partial<LogSettings>) => Promise<void>;
}

export const LogSettingsForm = ({ settings, onUpdate }: LogSettingsFormProps) => {
  if (!settings) return null;

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="w-4 h-4" />
          Log Instellingen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Log Level</Label>
          <RadioGroup
            value={settings.log_level}
            onValueChange={(value: LogLevel) => onUpdate({ log_level: value })}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/30">
              <RadioGroupItem value="basic" id="basic" />
              <div>
                <Label htmlFor="basic" className="font-medium cursor-pointer">Basic</Label>
                <p className="text-xs text-muted-foreground">Alleen belangrijke events</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/30">
              <RadioGroupItem value="verbose" id="verbose" />
              <div>
                <Label htmlFor="verbose" className="font-medium cursor-pointer">Verbose</Label>
                <p className="text-xs text-muted-foreground">Alle details inclusief debug info</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/30">
              <RadioGroupItem value="errors_only" id="errors_only" />
              <div>
                <Label htmlFor="errors_only" className="font-medium cursor-pointer">Errors Only</Label>
                <p className="text-xs text-muted-foreground">Alleen fouten loggen</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Retention Periode</Label>
          <Select
            value={settings.retention_days.toString()}
            onValueChange={(value) => onUpdate({ retention_days: parseInt(value) })}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dagen</SelectItem>
              <SelectItem value="30">30 dagen</SelectItem>
              <SelectItem value="90">90 dagen</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Logs ouder dan {settings.retention_days} dagen worden automatisch verwijderd.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
