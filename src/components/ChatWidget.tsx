import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useChatMessages } from '@/hooks/useChatMessages';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { messages, isTyping, handleSendMessage } = useChatMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSendMessage = async () => {
    if (message.trim()) {
      const messageToSend = message;
      setMessage('');
      await handleSendMessage(messageToSend);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 hover:scale-110 transition-all duration-200 shadow-lg z-50 ${isOpen ? 'hidden' : ''}`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-[#002C1F]" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[32rem] z-50 shadow-2xl border-0 flex flex-col">
          <ChatHeader onClose={() => setIsOpen(false)} />
          
          <CardContent className="flex-1 p-4 overflow-y-auto bg-background min-h-0">
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} text={msg.text} sender={msg.sender} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <ChatInput
            value={message}
            onChange={setMessage}
            onSend={onSendMessage}
            inputRef={inputRef}
          />
        </Card>
      )}
    </>
  );
};

export default ChatWidget;