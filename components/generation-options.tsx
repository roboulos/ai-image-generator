'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GenerationOptions } from '@/lib/types';
import { Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface GenerationOptionsProps {
  options: GenerationOptions;
  onChange: (options: GenerationOptions) => void;
  onEnhancePrompt?: () => void;
}

export function GenerationOptionsPanel({
  options,
  onChange,
  onEnhancePrompt,
}: GenerationOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Generation Options
        </Button>
        {onEnhancePrompt && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEnhancePrompt}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Enhance Prompt
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Size</label>
            <Select
              value={options.size}
              onValueChange={(value) =>
                onChange({ ...options, size: value as GenerationOptions['size'] })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Quality</label>
            <Select
              value={options.quality}
              onValueChange={(value) =>
                onChange({ ...options, quality: value as GenerationOptions['quality'] })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hd">HD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Style</label>
            <Select
              value={options.style}
              onValueChange={(value) =>
                onChange({ ...options, style: value as GenerationOptions['style'] })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vivid">Vivid</SelectItem>
                <SelectItem value="natural">Natural</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}