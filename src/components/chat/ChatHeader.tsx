import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <CardHeader className="bg-primary text-[#002C1F] rounded-t-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg text-[#002C1F]">Chatbot</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-[#002C1F] hover:bg-black/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};
