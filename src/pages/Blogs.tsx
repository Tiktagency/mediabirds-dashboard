import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Blogs = () => {
  return (
    <div className="min-h-screen hero-gradient">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            ← Terug naar Dashboard
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Blogs
        </h1>
        
        <div className="bg-white rounded-lg p-8">
          <p className="text-center text-muted-foreground mb-6">
            Druk op de start knop om blogs te genereren
          </p>
          <div className="flex justify-center">
            <Button size="lg">
              Start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
