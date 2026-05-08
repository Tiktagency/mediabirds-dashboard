import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Landingspagina = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-4">Landingspagina</h1>
        <p className="text-muted-foreground">
          Deze pagina is nog in ontwikkeling.
        </p>
      </div>
    </div>
  );
};

export default Landingspagina;
