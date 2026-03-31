import { useAdminAuth } from '@/hooks/useAdminAuth';
import { DashboardButton } from '@/components/dashboard/DashboardButton';
import { ArrowLeft, Users, Shield, Database, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminPanel = () => {
  const { isLoading, isAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient">
        <div className="text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Geen toegang</h1>
          <p className="text-muted-foreground mb-6">Je hebt geen toegang tot het admin panel.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient">
      {/* Header */}
      <header className="w-full py-6 px-6 border-b border-border/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Beheer</h2>
          <p className="text-muted-foreground">Beheer gebruikers, instellingen en systeem configuratie.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
          <DashboardButton 
            label="Gebruikers" 
            variant="primary"
            icon={Users}
            description="Beheer gebruikers en hun rollen."
            impact="high"
            disabled
          />
          <DashboardButton 
            label="Database" 
            variant="secondary"
            icon={Database}
            description="Bekijk en beheer database instellingen."
            impact="medium"
            disabled
          />
          <DashboardButton 
            label="Instellingen" 
            variant="accent"
            icon={Settings}
            description="Algemene systeem instellingen."
            impact="low"
            disabled
          />
        </div>

        <div className="mt-12 p-6 bg-card/50 rounded-lg border border-border/30">
          <h3 className="text-lg font-medium text-foreground mb-2">Admin functies komen binnenkort</h3>
          <p className="text-muted-foreground text-sm">
            Het admin panel is momenteel in ontwikkeling. Hier kun je straks gebruikers beheren, 
            database instellingen aanpassen en systeem configuraties wijzigen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
