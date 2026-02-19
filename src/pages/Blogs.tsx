import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Blogs = () => {
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <div className="px-6 py-6">
        <Button 
          variant="outline" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          asChild
        >
          <a href="https://mediabirds-dashboard.lovable.app/">
            ← Terug naar Dashboard
          </a>
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-20">
        <h1 className="text-5xl font-bold text-center mb-8 text-white">
          Blogs
        </h1>
        
        <p className="text-center text-white/90 text-lg mb-8">
          Druk op de start knop om blogs te genereren
        </p>
        
        <Button size="lg" className="px-12 py-6 text-lg h-auto">
          Start
        </Button>
      </div>
    </div>
  );
};

export default Blogs;
