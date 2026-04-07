import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';
import type { LogSettings } from '@/hooks/useLogSettings';

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
          Periode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
