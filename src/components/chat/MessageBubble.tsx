interface MessageBubbleProps {
  text: string;
  sender: 'user' | 'bot';
}

export const MessageBubble = ({ text, sender }: MessageBubbleProps) => {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
          sender === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {text}
      </div>
    </div>
  );
};
