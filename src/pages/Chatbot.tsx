import HeroSection from '@/components/HeroSection';

const Chatbot = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <HeroSection title="Chatbot" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-border/50 shadow-lg">
          <iframe
            src="https://lovable.dev/projects/f24ed1a4-763e-46d1-86cb-82d0d1ce21ff"
            className="w-full h-full"
            title="Chatbot Interface"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
