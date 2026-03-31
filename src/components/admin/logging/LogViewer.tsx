import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Search, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import type { AutomationLog } from '@/hooks/useLogSettings';

interface LogViewerProps {
  logs: AutomationLog[];
  onFilter: (filters?: { automation?: string; status?: string; limit?: number }) => Promise<void>;
  onExport: (format: 'csv' | 'json') => void;
}

const statusColors: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export const LogViewer = ({ logs, onFilter, onExport }: LogViewerProps) => {
  const [automationFilter, setAutomationFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilter = () => {
    onFilter({
      automation: automationFilter || undefined,
      status: statusFilter || undefined,
    });
  };

  const filteredLogs = logs.filter(log => 
    searchQuery === '' || 
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.automation_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueAutomations = [...new Set(logs.map(l => l.automation_name))];

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Log Viewer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('json')}>
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
                placeholder="Zoek in logs..."
              />
            </div>
          </div>
          <Select value={automationFilter} onValueChange={setAutomationFilter}>
            <SelectTrigger className="w-[180px] bg-background/50">
              <SelectValue placeholder="Alle automations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle automations</SelectItem>
              {uniqueAutomations.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-background/50">
              <SelectValue placeholder="Alle statussen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle statussen</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleFilter}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="border border-border/30 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/30">
                <TableHead className="w-[180px]">Tijdstip</TableHead>
                <TableHead className="w-[150px]">Automation</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Bericht</TableHead>
                <TableHead className="w-[100px]">Duur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Geen logs gevonden
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.slice(0, 50).map(log => (
                  <TableRow key={log.id} className="hover:bg-background/20">
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'dd MMM HH:mm:ss', { locale: nl })}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {log.automation_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[log.status] || statusColors.info}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-[400px] truncate">
                      {log.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.execution_time_ms ? `${log.execution_time_ms}ms` : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length > 50 && (
          <p className="text-xs text-muted-foreground text-center">
            Toont 50 van {filteredLogs.length} logs
          </p>
        )}
      </CardContent>
    </Card>
  );
};
