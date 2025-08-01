'use client';

import { useState, useEffect } from 'react';
import { ChatContainer } from '@/components/chat-container';
import { ChatInput } from '@/components/chat-input';
import { ChatMessage, MessageStatus, GenerationOptions, ChatSession, LoRASettings } from '@/lib/types';
import { toast } from 'sonner';
import { CommandPalette } from '@/components/command-palette';
import { GenerationOptionsPanel } from '@/components/generation-options';
import { PromptTemplates } from '@/components/prompt-templates';
import { Sidebar } from '@/components/sidebar';
import { LoRASettings as LoRASettingsComponent } from '@/components/lora-settings';
import { SessionManager } from '@/lib/session-manager';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { ImageGallery } from '@/components/image-gallery';

export default function ImageGenerator() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loraSettings, setLoraSettings] = useState<LoRASettings>({});
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid',
  });

  // Load sessions and current session on mount
  useEffect(() => {
    const loadedSessions = SessionManager.getSessions();
    setSessions(loadedSessions);

    const currentSessionId = SessionManager.getCurrentSessionId();
    let session: ChatSession | null = null;

    if (currentSessionId) {
      session = loadedSessions.find(s => s.id === currentSessionId) || null;
    }

    if (!session && loadedSessions.length > 0) {
      // Use the most recent session
      session = loadedSessions.sort((a, b) => 
        b.updatedAt.getTime() - a.updatedAt.getTime()
      )[0];
    }

    if (!session) {
      // Create a new session if none exists
      session = SessionManager.createNewSession();
      setSessions([session]);
    }

    setCurrentSession(session);
    setMessages(session.messages);
    if (session.settings) {
      setGenerationOptions(session.settings);
    }
  }, []);

  // Save messages to current session whenever they change
  useEffect(() => {
    if (currentSession) {
      SessionManager.updateSessionMessages(currentSession.id, messages);
    }
  }, [messages, currentSession]);

  // Update generation options with LoRA settings
  useEffect(() => {
    setGenerationOptions(prev => ({
      ...prev,
      lora: loraSettings
    }));
  }, [loraSettings]);

  const generateImage = async (prompt: string, messageId: string) => {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          ...generationOptions,
          lora: loraSettings 
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
    handleNewSession();
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
      if (session.settings) {
        setGenerationOptions(session.settings);
      }
      SessionManager.setCurrentSessionId(sessionId);
      setSidebarOpen(false);
    }
  };

  const handleNewSession = () => {
    const newSession = SessionManager.createNewSession();
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    setMessages([]);
    setSidebarOpen(false);
    toast.success('New chat created');
  };

  const handleDeleteSession = (sessionId: string) => {
    SessionManager.deleteSession(sessionId);
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);

    if (currentSession?.id === sessionId) {
      if (remainingSessions.length > 0) {
        handleSelectSession(remainingSessions[0].id);
      } else {
        handleNewSession();
      }
    }
    toast.success('Chat deleted');
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    SessionManager.renameSession(sessionId, newTitle);
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title: newTitle, updatedAt: new Date() } : s
    ));
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null);
    }
  };

  const handleToggleStar = (sessionId: string) => {
    SessionManager.toggleStar(sessionId);
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, starred: !s.starred } : s
    ));
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
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onToggleStar={handleToggleStar}
      />

      {/* Command Palette */}
      <CommandPalette
        onNewChat={handleClearChat}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        onOpenSettings={() => setSidebarOpen(true)}
      />

      {/* Header */}
      <header className="border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{currentSession?.title || 'AI Image Generator'}</h1>
              <p className="text-sm text-muted-foreground">Powered by DALL-E 3 • Press ⌘K for commands</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ImageGallery
              messages={messages}
              onDelete={handleDelete}
              onFavorite={(messageId) => toast.info('Favorites coming soon!')}
              onAddToCollection={(messageId, collection) => toast.info('Collections coming soon!')}
            />
            <LoRASettingsComponent
              settings={loraSettings}
              onSettingsChange={setLoraSettings}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hidden md:flex"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
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
