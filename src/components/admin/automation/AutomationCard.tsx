import { useState } from 'react';
import { ChevronDown, ChevronUp, Globe, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusToggle } from './StatusToggle';
import type { AutomationSetting, ImpactLevel, AutomationStatusType } from '@/hooks/useAutomationSettings';

interface AutomationCardProps {
  setting: AutomationSetting;
  onUpdate: (id: string, updates: Partial<AutomationSetting>) => Promise<void>;
}

const CATEGORIES = ['Planning', 'SEO', 'Content', 'Klantenservice', 'Marketing', 'Anders'];

const impactColors: Record<ImpactLevel, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export const AutomationCard = ({ setting, onUpdate }: AutomationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSetting, setLocalSetting] = useState(setting);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(localSetting) !== JSON.stringify(setting);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate(setting.id, {
      display_name: localSetting.display_name,
      description: localSetting.description,
      impact_level: localSetting.impact_level,
      category: localSetting.category,
      status: localSetting.status,
      webhook_url: localSetting.webhook_url,
      webhook_backup_url: localSetting.webhook_backup_url,
    });
    setIsSaving(false);
  };

  const handleStatusChange = (status: AutomationStatusType) => {
    setLocalSetting(prev => ({ ...prev, status }));
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader 
        className="cursor-pointer hover:bg-card/70 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{setting.display_name}</CardTitle>
            <Badge variant="outline" className={impactColors[setting.impact_level]}>
              {setting.impact_level}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              {setting.category || 'Geen categorie'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <StatusToggle 
              status={localSetting.status} 
              onChange={handleStatusChange}
            />
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${setting.id}`}>Weergavenaam</Label>
              <Input
                id={`name-${setting.id}`}
                value={localSetting.display_name}
                onChange={(e) => setLocalSetting(prev => ({ ...prev, display_name: e.target.value }))}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`category-${setting.id}`}>Categorie</Label>
              <Select
                value={localSetting.category || ''}
                onValueChange={(value) => setLocalSetting(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Kies categorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`desc-${setting.id}`}>Beschrijving</Label>
            <Textarea
              id={`desc-${setting.id}`}
              value={localSetting.description || ''}
              onChange={(e) => setLocalSetting(prev => ({ ...prev, description: e.target.value }))}
              className="bg-background/50 min-h-[80px]"
              placeholder="Beschrijf wat deze automation doet..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`impact-${setting.id}`}>Impact Level</Label>
            <Select
              value={localSetting.impact_level}
              onValueChange={(value: ImpactLevel) => setLocalSetting(prev => ({ ...prev, impact_level: value }))}
            >
              <SelectTrigger className="bg-background/50 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    High
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    Low
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border/30 pt-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Webhook URLs
            </h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`webhook-${setting.id}`}>Primaire Webhook URL</Label>
                <Input
                  id={`webhook-${setting.id}`}
                  value={localSetting.webhook_url || ''}
                  onChange={(e) => setLocalSetting(prev => ({ ...prev, webhook_url: e.target.value }))}
                  className="bg-background/50 font-mono text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`webhook-backup-${setting.id}`}>Backup Webhook URL (optioneel)</Label>
                <Input
                  id={`webhook-backup-${setting.id}`}
                  value={localSetting.webhook_backup_url || ''}
                  onChange={(e) => setLocalSetting(prev => ({ ...prev, webhook_backup_url: e.target.value }))}
                  className="bg-background/50 font-mono text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-4 border-t border-border/30">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Opslaan...' : 'Wijzigingen opslaan'}
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
