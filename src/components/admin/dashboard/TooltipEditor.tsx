import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Save } from 'lucide-react';
import type { AutomationSetting } from '@/hooks/useAutomationSettings';

interface TooltipEditorProps {
  automations: AutomationSetting[];
  customTooltips: Record<string, string>;
  onUpdate: (automationName: string, tooltip: string) => Promise<void>;
}

export const TooltipEditor = ({ automations, customTooltips, onUpdate }: TooltipEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (automationName: string) => {
    setEditingId(automationName);
    setEditValue(customTooltips[automationName] || '');
  };

  const handleSave = async (automationName: string) => {
    setIsSaving(true);
    await onUpdate(automationName, editValue);
    setIsSaving(false);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4" />
          Tooltip Teksten
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pas de tooltip teksten aan die verschijnen bij de info-iconen op het dashboard.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {automations.map(automation => (
            <div 
              key={automation.id}
              className="p-4 rounded-lg bg-background/50 border border-border/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-foreground mb-2">{automation.display_name}</p>
                  
                  {editingId === automation.automation_name ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-background/50 min-h-[80px]"
                        placeholder="Voer een custom tooltip tekst in..."
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(automation.automation_name)}
                          disabled={isSaving}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {isSaving ? 'Opslaan...' : 'Opslaan'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={handleCancel}
                        >
                          Annuleren
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {customTooltips[automation.automation_name] || automation.description || 'Geen tooltip ingesteld'}
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2 h-7 text-xs"
                        onClick={() => handleEdit(automation.automation_name)}
                      >
                        Bewerken
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
