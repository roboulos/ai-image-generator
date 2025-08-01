'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Download, 
  MoreVertical, 
  Copy, 
  RefreshCw,
  Sparkles,
  User,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: ChatMessageType;
  onRegenerate?: (prompt: string) => void;
  onDelete?: (id: string) => void;
}

export function ChatMessage({ message, onRegenerate, onDelete }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const showImage = message.image && message.status === 'completed';
  const isGenerating = message.status === 'generating';
  const hasError = message.status === 'error';

  const handleDownload = () => {
    if (!message.image) return;
    
    const link = document.createElement('a');
    link.href = message.image.url;
    link.download = `ai-generated-${message.id}.png`;
    link.click();
    toast.success('Image downloaded!');
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Prompt copied to clipboard!');
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-6',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser && 'items-end')}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {isUser ? 'You' : 'AI Assistant'} · {formatTime(message.timestamp)}
          </span>
          {message.status === 'sending' && (
            <Badge variant="secondary" className="text-xs">Sending</Badge>
          )}
          {isGenerating && (
            <Badge variant="secondary" className="text-xs">Generating</Badge>
          )}
          {hasError && (
            <Badge variant="destructive" className="text-xs">Error</Badge>
          )}
        </div>

        <div
          className={cn(
            'rounded-lg px-3 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {hasError && message.error && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{message.error}</p>
          </div>
        )}

        {isGenerating && !isUser && (
          <div className="space-y-3 w-full">
            <Skeleton className="h-64 w-full max-w-md rounded-lg" />
          </div>
        )}

        {showImage && message.image && (
          <div className="relative group">
            <img
              src={message.image.url}
              alt="Generated image"
              className="rounded-lg max-w-md w-full h-auto"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyPrompt}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Prompt
                  </DropdownMenuItem>
                  {onRegenerate && (
                    <DropdownMenuItem onClick={() => onRegenerate(message.content)}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}