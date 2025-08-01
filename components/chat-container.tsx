'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatMessage } from '@/components/chat-message';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface ChatContainerProps {
  messages: ChatMessageType[];
  onRegenerate: (prompt: string) => void;
  onDelete: (id: string) => void;
  onSendMessage?: (message: string) => void;
}

export function ChatContainer({ messages, onRegenerate, onDelete, onSendMessage }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Welcome to AI Image Generator</h2>
          <p className="text-muted-foreground max-w-md">
            Start by describing what you'd like to see. Be specific and creative!
          </p>
          <div className="grid gap-2 max-w-md mx-auto text-sm">
            <p className="text-left text-muted-foreground">Try something like:</p>
            <div className="grid gap-2">
              <button 
                onClick={() => onSendMessage?.("A serene Japanese garden with cherry blossoms")}
                className="text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                "A serene Japanese garden with cherry blossoms"
              </button>
              <button 
                onClick={() => onSendMessage?.("A futuristic cityscape at night with neon lights")}
                className="text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                "A futuristic cityscape at night with neon lights"
              </button>
              <button 
                onClick={() => onSendMessage?.("A magical forest with glowing mushrooms")}
                className="text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                "A magical forest with glowing mushrooms"
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col">
        {messages.map((message, index) => (
          <div key={message.id}>
            <ChatMessage
              message={message}
              onRegenerate={onRegenerate}
              onDelete={onDelete}
            />
            {index < messages.length - 1 && <Separator />}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
}