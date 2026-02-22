import { useState } from 'react';

export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 1,
  text: 'Voorbeeld:\n\nNodige gegeven:\nMediabirds, Pakket B, 10-2-2025, 10-5-2025\n\nFases:\nWebdesign, Development, Testen & feedback, Marketing, Livegang',
  sender: 'bot'
};

const WEBHOOK_URL = 'https://tikt.app.n8n.cloud/webhook/31605fee-d222-4693-accb-69e6ca4cdffd';
const API_KEY = 'JGMhfDirhe73J5DvjeG6dJ8';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      text,
      sender
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessageToWebhook = async (messageText: string) => {
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': API_KEY,
        },
        body: JSON.stringify({
          message: messageText,
          timestamp: new Date().toISOString(),
          sender: 'user'
        }),
      });

      const responseText = await response.text();
      if (!responseText) return null;

      const responseData = JSON.parse(responseText);
      return parseWebhookResponse(responseData);
    } catch (error) {
      console.error('Error sending message to webhook:', error);
      return null;
    }
  };

  const parseWebhookResponse = (responseData: any): string | null => {
    if (responseData.code === 0 && responseData.message) {
      return `Fout: ${responseData.message}`;
    }
    
    if (responseData.message?.content) {
      if (typeof responseData.message.content === 'string') {
        return responseData.message.content;
      }
      if (responseData.message.content.Error) {
        return `Fout: ${responseData.message.content.Error}`;
      }
      return JSON.stringify(responseData.message.content, null, 2);
    }
    
    if (responseData.output) {
      return responseData.output;
    }
    
    return 'Onbekende respons ontvangen';
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    addMessage(messageText, 'user');
    setIsTyping(true);

    try {
      const botResponse = await sendMessageToWebhook(messageText);
      if (botResponse) {
        addMessage(botResponse, 'bot');
      }
    } catch (error) {
      addMessage('Fout bij het verwerken van de respons', 'bot');
    } finally {
      setIsTyping(false);
    }
  };

  return {
    messages,
    isTyping,
    handleSendMessage
  };
};
