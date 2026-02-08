import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'bot' }>>([
    { id: 1, text: 'Alle vragen over tikt kunnen hier worden beantwoord ;)', sender: 'bot' }
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
        const response = await fetch('https://tikt.app.n8n.cloud/webhook/9eab6690-3978-4985-b818-1cddf5daf206', {
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
            // Add bot response from webhook
            if (responseData.output) {
              const botResponse = { 
                id: Date.now() + 1, 
                text: responseData.output, 
                sender: 'bot' as const 
              };
              setMessages(prev => [...prev, botResponse]);
            }
          } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
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
    <>
      {/* Chat Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[hsl(var(--tikt-primary))] to-[hsl(var(--tikt-secondary))] hover:scale-110 transition-all duration-200 shadow-lg z-50 ${isOpen ? 'hidden' : ''}`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 z-50 shadow-2xl border-0 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-[hsl(var(--tikt-primary))] to-[hsl(var(--tikt-secondary))] text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tikt Support</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-y-auto bg-background min-h-0">
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[hsl(var(--tikt-secondary))] text-white'
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
      )}
    </>
  );
};

export default ChatWidget;