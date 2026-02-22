import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardFooter } from '@/components/ui/card';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const ChatInput = ({ value, onChange, onSend, inputRef }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <CardFooter className="p-4 border-t flex-shrink-0">
      <div className="flex w-full gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Typ je bericht..."
          className="flex-1"
        />
        <Button onClick={onSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  );
};
