'use client';

import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  FileImage, 
  MessageSquare, 
  Settings, 
  Trash2, 
  Download,
  Copy,
  RefreshCw
} from 'lucide-react';

interface CommandPaletteProps {
  onNewChat: () => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onOpenSettings: () => void;
}

export function CommandPalette({
  onNewChat,
  onClearChat,
  onExportChat,
  onOpenSettings,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Chat">
          <CommandItem onSelect={() => runCommand(onNewChat)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onClearChat)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Chat
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onExportChat)}>
            <Download className="mr-2 h-4 w-4" />
            Export Chat
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(onOpenSettings)}>
            <Settings className="mr-2 h-4 w-4" />
            Open Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <FileImage className="mr-2 h-4 w-4" />
            Generate Landscape Image
          </CommandItem>
          <CommandItem>
            <FileImage className="mr-2 h-4 w-4" />
            Generate Portrait Image
          </CommandItem>
          <CommandItem>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate Last Image
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}