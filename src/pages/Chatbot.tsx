import HeroSection from '@/components/HeroSection';

const Chatbot = () => {
  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <HeroSection title="Chatbot" />
      
      <div className="flex-1 w-full max-w-6xl mx-auto px-6 pb-8">
        <iframe
          src="https://sand-shade-chat.lovable.app"
          title="Chatbot Interface"
          className="w-full h-[calc(100vh-200px)] rounded-xl border border-border shadow-lg"
          allow="microphone"
        />
      </div>
    </div>
  );
};

export default Chatbot;
