import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react';
import type { LogSettings } from '@/hooks/useLogSettings';

interface AlertConfigurationProps {
  settings: LogSettings | null;
  onUpdate: (updates: Partial<LogSettings>) => Promise<void>;
}

export const AlertConfiguration = ({ settings, onUpdate }: AlertConfigurationProps) => {
  if (!settings) return null;

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-4 h-4" />
          Alert Configuratie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Ontvang email bij errors</p>
              </div>
            </div>
            <Switch
              checked={settings.email_alerts_enabled}
              onCheckedChange={(checked) => onUpdate({ email_alerts_enabled: checked })}
            />
          </div>

          {settings.email_alerts_enabled && (
            <div className="pl-4 space-y-2">
              <Label htmlFor="alert-email">Alert Email</Label>
              <Input
                id="alert-email"
                type="email"
                value={settings.alert_email || ''}
                onChange={(e) => onUpdate({ alert_email: e.target.value })}
                className="bg-background/50"
                placeholder="alerts@example.com"
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">Slack Alerts</Label>
                <p className="text-xs text-muted-foreground">Stuur alerts naar Slack</p>
              </div>
            </div>
            <Switch
              checked={settings.slack_alerts_enabled}
              onCheckedChange={(checked) => onUpdate({ slack_alerts_enabled: checked })}
            />
          </div>

          {settings.slack_alerts_enabled && (
            <div className="pl-4 space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                value={settings.slack_webhook_url || ''}
                onChange={(e) => onUpdate({ slack_webhook_url: e.target.value })}
                className="bg-background/50 font-mono text-sm"
                placeholder="https://hooks.slack.com/..."
              />
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="font-medium">Dashboard Badge</Label>
                <p className="text-xs text-muted-foreground">Toon waarschuwing in dashboard</p>
              </div>
            </div>
            <Switch
              checked={settings.dashboard_badge_enabled}
              onCheckedChange={(checked) => onUpdate({ dashboard_badge_enabled: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
