export type MessageRole = 'user' | 'assistant';
export type MessageStatus = 'sending' | 'generating' | 'completed' | 'error' | 'streaming';

export interface ImageData {
  url: string;
  mediaType: string;
  size?: string;
  style?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  image?: ImageData;
  images?: ImageData[]; // For multiple images
  error?: string;
  metadata?: {
    model?: string;
    enhanced?: boolean;
    variations?: number;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  isGenerating: boolean;
}

export interface GenerationOptions {
  size: '1024x1024' | '1792x1024' | '1024x1792';
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  n?: number; // Number of variations
  lora?: LoRASettings;
}

export interface LoRASettings {
  model?: string;
  strength?: number; // 0-1
  stylePreset?: string;
  negativePrompt?: string;
  cfgScale?: number; // 1-20
  seed?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  settings?: GenerationOptions;
  starred?: boolean;
}

export interface ImageMetadata {
  id: string;
  prompt: string;
  settings: GenerationOptions;
  createdAt: Date;
  tags?: string[];
  favorite?: boolean;
  sessionId?: string;
  collections?: string[];
}