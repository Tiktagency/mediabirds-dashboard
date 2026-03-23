import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Chatbot = () => {
  return (
    <div className="h-screen w-screen overflow-hidden hero-gradient p-6">
      <div className="absolute top-6 left-6 z-10">
        <Link to="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="w-full h-full pt-12">
        <iframe
          src="https://sand-shade-chat.lovable.app"
          title="Chatbot Interface"
          className="w-full h-full rounded-xl border border-white/20 shadow-lg"
          allow="microphone"
        />
      </div>
    </div>
  );
};

export default Chatbot;
