'use client';

import { useState, useEffect } from 'react';
import { ChatContainer } from '@/components/chat-container';
import { ChatInput } from '@/components/chat-input';
import { ChatMessage, MessageStatus, GenerationOptions } from '@/lib/types';
import { toast } from 'sonner';
import { CommandPalette } from '@/components/command-palette';
import { GenerationOptionsPanel } from '@/components/generation-options';
import { PromptTemplates } from '@/components/prompt-templates';

export default function ImageGenerator() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
  });

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const generateImage = async (prompt: string, messageId: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          ...generationOptions 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      // Update message with generated image
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              status: 'completed' as MessageStatus,
              image: {
                url: `data:${data.mediaType};base64,${data.image}`,
                mediaType: data.mediaType
              }
            }
          : msg
      ));

      toast.success('Image generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      
      // Update message with error
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              status: 'error' as MessageStatus,
              error: errorMessage
            }
          : msg
      ));

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'completed'
    };

    // Create AI message
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Generating image for: "${content}"`,
      timestamp: new Date(),
      status: 'generating'
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setIsGenerating(true);

    // Generate image
    await generateImage(content, aiMessage.id);
  };

  const handleRegenerate = async (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast.success('Message deleted');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat-messages');
    toast.success('Chat cleared');
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exported');
  };

  const handleSelectTemplate = (template: string) => {
    setInputValue(template);
  };

  const handleEnhancePrompt = async () => {
    // For now, just add some enhancement words
    if (inputValue) {
      setInputValue(`${inputValue}, highly detailed, professional quality, stunning composition`);
      toast.success('Prompt enhanced!');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette
        onNewChat={handleClearChat}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onOpenSettings={() => toast.info('Settings coming soon!')}
      />

      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">AI Image Generator</h1>
            <p className="text-sm text-muted-foreground">Powered by DALL-E 3 • Press ⌘K for commands</p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-hidden max-w-4xl mx-auto w-full">
        <ChatContainer 
          messages={messages}
          onRegenerate={handleRegenerate}
          onDelete={handleDelete}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Input Section */}
      <div className="max-w-4xl mx-auto w-full">
        <PromptTemplates onSelectTemplate={handleSelectTemplate} />
        <GenerationOptionsPanel
          options={generationOptions}
          onChange={setGenerationOptions}
          onEnhancePrompt={handleEnhancePrompt}
        />
        <ChatInput 
          onSendMessage={(content) => {
            handleSendMessage(content);
            setInputValue('');
          }}
          disabled={isGenerating}
          placeholder={isGenerating ? "Generating image..." : "Describe an image to generate..."}
          value={inputValue}
          onChange={setInputValue}
        />
      </div>
    </div>
  );
}
