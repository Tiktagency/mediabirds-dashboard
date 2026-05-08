import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('trigger-monday-planning', {
        body: { message: messageText },
      });
      if (error) {
        console.error('Edge function error:', error);
        return null;
      }
      const responseText = (data as { text?: string })?.text;
      if (!responseText) return null;
      let responseData: unknown;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        return responseText;
      }
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

  const updateAutomationStatus = async (status: 'active' | 'running' | 'inactive') => {
    try {
      await supabase.functions.invoke('update-automation-status', {
        body: {
          automation_name: 'monday-planning',
          status,
          last_run: status === 'active' ? new Date().toISOString() : undefined
        }
      });
    } catch (error) {
      console.error('Error updating automation status:', error);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    addMessage(messageText, 'user');
    setIsTyping(true);
    
    // Update status to running
    await updateAutomationStatus('running');

    try {
      const botResponse = await sendMessageToWebhook(messageText);
      if (botResponse) {
        addMessage(botResponse, 'bot');
        // Update status to active on success
        await updateAutomationStatus('active');
      } else {
        // Update status to inactive if no response
        await updateAutomationStatus('inactive');
      }
    } catch (error) {
      addMessage('Fout bij het verwerken van de respons', 'bot');
      // Update status to inactive on error
      await updateAutomationStatus('inactive');
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
