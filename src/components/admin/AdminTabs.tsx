import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, FileText, Users, LayoutDashboard, Shield } from 'lucide-react';
import { AutomationTab } from './automation/AutomationTab';
import { LoggingTab } from './logging/LoggingTab';
import { UsersTab } from './users/UsersTab';
import { DashboardTab } from './dashboard/DashboardTab';
import { RolesTab } from './roles/RolesTab';

export const AdminTabs = () => {
  return (
    <Tabs defaultValue="automations" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-card/50 border border-border/30">
        <TabsTrigger value="automations" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Automatiseringen</span>
        </TabsTrigger>
        <TabsTrigger value="logging" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Logging</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Gebruikers</span>
        </TabsTrigger>
        <TabsTrigger value="roles" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <Shield className="w-4 h-4" />
          <span className="hidden sm:inline">Rollen</span>
        </TabsTrigger>
        <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="automations" className="mt-6">
        <AutomationTab />
      </TabsContent>

      <TabsContent value="logging" className="mt-6">
        <LoggingTab />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="roles" className="mt-6">
        <RolesTab />
      </TabsContent>

      <TabsContent value="dashboard" className="mt-6">
        <DashboardTab />
      </TabsContent>
    </Tabs>
  );
};
