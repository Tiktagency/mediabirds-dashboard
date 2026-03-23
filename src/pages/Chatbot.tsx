const Chatbot = () => {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <iframe
        src="https://sand-shade-chat.lovable.app"
        title="Chatbot Interface"
        className="w-full h-full border-0"
        allow="microphone"
      />
    </div>
  );
};

export default Chatbot;
