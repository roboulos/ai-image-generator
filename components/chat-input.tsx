'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizontal } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function ChatInput({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Describe an image to generate...",
  value,
  onChange
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputValue = value !== undefined ? value : input;
  const handleInputChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInput(newValue);
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      handleInputChange('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-background">
      <Input
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
        autoFocus
      />
      <Button 
        onClick={handleSubmit}
        disabled={disabled || !inputValue.trim()}
        size="icon"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
}