import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { toast } from 'sonner';

interface ChatInputProps {
  tripId: string;
}

export function ChatInput({ tripId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (socket) {
      socket.emit('chat:typing:start', { tripId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing:stop', { tripId });
      }, 2000);
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    try {
      setIsSending(true);
      await chatApi.sendMessage(tripId, { body: trimmed });
      setMessage('');
      if (socket) socket.emit('chat:typing:stop', { tripId });
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 border-t bg-background">
      <div className="relative flex items-end gap-2 bg-muted/50 border rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all p-1 pl-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full max-h-[120px] bg-transparent resize-none outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground custom-scrollbar"
          rows={1}
          disabled={isSending}
        />
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 mb-1 shrink-0 text-primary hover:text-primary hover:bg-primary/10 rounded-full"
          onClick={handleSend}
          disabled={!message.trim() || isSending}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
