export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'generating' | 'completed' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  image?: {
    url: string;
    mediaType: string;
  };
  error?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
}