import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot' }>>([
    { id: 1, text: 'Voorbeeld:\n\nNodige gegeven:\nMediabirds, Pakket B, 10-2-2025, 10-5-2025\n\nFases:\nWebdesign, Development, Testen & feedback, Marketing, Livegang', sender: 'bot' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = { id: Date.now(), text: message, sender: 'user' as const };
      setMessages(prev => [...prev, newMessage]);
      const messageText = message;
      setMessage('');
      setIsTyping(true);
      
      // Re-focus input after sending
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      
      // Send to webhook
      try {
        const response = await fetch('https://tikt.app.n8n.cloud/webhook/31605fee-d222-4693-accb-69e6ca4cdffd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': 'JGMhfDirhe73J5DvjeG6dJ8',
          },
          body: JSON.stringify({
            message: messageText,
            timestamp: new Date().toISOString(),
            sender: 'user'
          }),
        });
        
        // Check if response has content before parsing JSON
        const responseText = await response.text();
        if (responseText) {
          try {
            const responseData = JSON.parse(responseText);
            let botMessage = '';
            
            // Handle error responses
            if (responseData.code === 0 && responseData.message) {
              botMessage = `Fout: ${responseData.message}`;
            }
            // Handle successful responses with message structure
            else if (responseData.message?.content) {
              if (typeof responseData.message.content === 'string') {
                botMessage = responseData.message.content;
              } else if (responseData.message.content.Error) {
                botMessage = `Fout: ${responseData.message.content.Error}`;
              } else {
                botMessage = JSON.stringify(responseData.message.content, null, 2);
              }
            }
            // Handle direct output field
            else if (responseData.output) {
              botMessage = responseData.output;
            }
            // Fallback for other response structures
            else {
              botMessage = 'Onbekende respons ontvangen';
            }
            
            if (botMessage) {
              const botResponse = { 
                id: Date.now() + 1, 
                text: botMessage, 
                sender: 'bot' as const 
              };
              setMessages(prev => [...prev, botResponse]);
            }
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            const errorResponse = { 
              id: Date.now() + 1, 
              text: 'Fout bij het verwerken van de respons', 
              sender: 'bot' as const 
            };
            setMessages(prev => [...prev, errorResponse]);
          }
        }
      } catch (error) {
        console.error('Error sending message to webhook:', error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 z-50">
      <h2 className="text-2xl font-bold text-white text-center mb-4">Chatbot</h2>
      <Card className="w-96 h-[32rem] shadow-2xl border-0 flex flex-col">
        <CardContent className="flex-1 p-4 overflow-y-auto bg-white min-h-0">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.text}
              </div>
            </div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
               <div className="max-w-[80%] p-3 rounded-lg text-sm bg-muted text-foreground">
                 <span className="italic text-muted-foreground">aan het typen...</span>
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t flex-shrink-0">
        <div className="flex w-full gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Typ je bericht..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
    </div>
  );
};

export default ChatWidget;