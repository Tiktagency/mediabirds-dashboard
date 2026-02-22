import { Button } from '@/components/ui/button';

const Blogs = () => {
  return (
    <div className="min-h-screen hero-gradient flex flex-col items-center justify-center px-6">
        <h1 className="text-5xl font-bold text-center mb-8 text-white">
          Blogs
        </h1>
        
        <p className="text-center text-white/90 text-lg mb-8">
          Druk op de start knop om blogs te genereren
        </p>
        
      <Button 
        size="lg" 
        className="px-12 py-6 text-lg h-auto"
        asChild
      >
        <a href="https://seo-interface.lovable.app/" target="_blank" rel="noopener noreferrer">
          Start
        </a>
      </Button>
    </div>
  );
};

export default Blogs;
