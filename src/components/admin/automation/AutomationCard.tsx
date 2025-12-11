import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Globe, Save, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StatusToggle } from './StatusToggle';
import type { AutomationSetting, ImpactLevel, AutomationStatusType } from '@/hooks/useAutomationSettings';

interface ImpactColors {
  high: string;
  medium: string;
  low: string;
}

interface AutomationCardProps {
  setting: AutomationSetting;
  onUpdate: (id: string, updates: Partial<AutomationSetting>) => Promise<void>;
  impactColors?: ImpactColors;
}

const CATEGORIES = ['Planning', 'SEO', 'Content', 'Klantenservice', 'Marketing', 'Anders'];

const defaultImpactColors: ImpactColors = {
  high: '#ef4444',
  medium: '#eab308',
  low: '#6b7280',
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const AutomationCard = ({ setting, onUpdate, impactColors = defaultImpactColors }: AutomationCardProps) => {
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
      n8n_workflow_name: localSetting.n8n_workflow_name,
      time_saved_per_execution: localSetting.time_saved_per_execution,
    });
    setIsSaving(false);
  };

  const handleStatusChange = async (status: AutomationStatusType) => {
    setLocalSetting(prev => ({ ...prev, status }));
    // Auto-save status changes immediately
    await onUpdate(setting.id, { status });
  };

  const getImpactStyle = (level: ImpactLevel) => {
    const color = impactColors[level];
    return {
      backgroundColor: hexToRgba(color, 0.2),
      color: color,
      borderColor: hexToRgba(color, 0.3),
    };
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
            <Badge 
              variant="outline" 
              style={getImpactStyle(setting.impact_level)}
            >
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
                value={localSetting.category || undefined}
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
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: impactColors.high }}
                    />
                    High
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: impactColors.medium }}
                    />
                    Medium
                  </span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: impactColors.low }}
                    />
                    Low
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border/30 pt-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tijdsbesparing
            </h4>
            <div className="space-y-2">
              <Label htmlFor={`time-saved-${setting.id}`}>Tijdsbesparing per execution (minuten)</Label>
              <Input
                id={`time-saved-${setting.id}`}
                type="number"
                min="0"
                value={localSetting.time_saved_per_execution ?? 5}
                onChange={(e) => setLocalSetting(prev => ({ ...prev, time_saved_per_execution: parseInt(e.target.value) || 0 }))}
                className="bg-background/50 w-32"
                placeholder="5"
              />
              <p className="text-xs text-muted-foreground">
                Aantal minuten dat per succesvolle execution wordt bespaard.
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 pt-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              N8N Configuratie
            </h4>
            <div className="space-y-2">
              <Label htmlFor={`n8n-name-${setting.id}`}>N8N Workflow Naam</Label>
              <Input
                id={`n8n-name-${setting.id}`}
                value={localSetting.n8n_workflow_name || ''}
                onChange={(e) => setLocalSetting(prev => ({ ...prev, n8n_workflow_name: e.target.value }))}
                className="bg-background/50 font-mono text-sm"
                placeholder="bijv. MEDIABIRDS monday planning"
              />
              <p className="text-xs text-muted-foreground">
                De exacte naam van de workflow in n8n voor API integratie.
              </p>
            </div>
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
