'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Palette, 
  Mountain, 
  Building2, 
  Sparkles, 
  Users,
  Trees,
  Waves,
  Moon
} from 'lucide-react';

interface Template {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const templates: Template[] = [
  {
    id: 'portrait',
    label: 'Portrait',
    prompt: 'Professional portrait photography, soft natural lighting, shallow depth of field',
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: 'landscape',
    label: 'Landscape',
    prompt: 'Breathtaking landscape photography, golden hour lighting, epic composition',
    icon: <Mountain className="h-4 w-4" />,
  },
  {
    id: 'abstract',
    label: 'Abstract',
    prompt: 'Abstract digital art, vibrant colors, geometric patterns, modern design',
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: 'architecture',
    label: 'Architecture',
    prompt: 'Modern architecture photography, clean lines, dramatic perspective',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    prompt: 'Fantasy art illustration, magical atmosphere, intricate details',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'nature',
    label: 'Nature',
    prompt: 'Nature photography, wildlife, natural beauty, environmental portrait',
    icon: <Trees className="h-4 w-4" />,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    prompt: 'Ocean waves, underwater photography, marine life, seascape',
    icon: <Waves className="h-4 w-4" />,
  },
  {
    id: 'night',
    label: 'Night',
    prompt: 'Night photography, stars, moon, city lights, long exposure',
    icon: <Moon className="h-4 w-4" />,
  },
];

interface PromptTemplatesProps {
  onSelectTemplate: (template: string) => void;
}

export function PromptTemplates({ onSelectTemplate }: PromptTemplatesProps) {
  return (
    <div className="border-t p-3">
      <p className="text-xs font-medium mb-2 text-muted-foreground">Quick Templates</p>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => onSelectTemplate(template.prompt)}
              className="gap-2 flex-shrink-0"
            >
              {template.icon}
              {template.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}