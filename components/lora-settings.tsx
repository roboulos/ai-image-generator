'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoRASettings as LoRASettingsType } from '@/lib/types';
import { Settings2, Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LoRASettingsProps {
  settings: LoRASettingsType;
  onSettingsChange: (settings: LoRASettingsType) => void;
}

const presetStyles = [
  { value: 'none', label: 'None' },
  { value: 'anime', label: 'Anime' },
  { value: 'photographic', label: 'Photographic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'comic-book', label: 'Comic Book' },
  { value: 'fantasy-art', label: 'Fantasy Art' },
  { value: '3d-model', label: '3D Model' },
  { value: 'analog-film', label: 'Analog Film' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'pixel-art', label: 'Pixel Art' },
];

export function LoRASettings({ settings, onSettingsChange }: LoRASettingsProps) {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<LoRASettingsType>(settings);

  const handleApply = () => {
    onSettingsChange(localSettings);
    setOpen(false);
  };

  const handleReset = () => {
    const defaultSettings: LoRASettingsType = {
      strength: 0.75,
      cfgScale: 7,
    };
    setLocalSettings(defaultSettings);
  };

  const handleRandomSeed = () => {
    setLocalSettings({
      ...localSettings,
      seed: Math.floor(Math.random() * 2147483647),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          LoRA Settings
          {(settings.model || settings.stylePreset) && (
            <Badge variant="secondary" className="ml-1">
              Active
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Generation Settings</DialogTitle>
          <DialogDescription>
            Fine-tune your image generation with LoRA models and advanced parameters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* LoRA Model */}
          <div className="space-y-2">
            <Label htmlFor="lora-model">LoRA Model</Label>
            <Input
              id="lora-model"
              placeholder="e.g., sd-1.5-lcm-lora-weights"
              value={localSettings.model || ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, model: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Optional: Specify a custom LoRA model for style adaptation
            </p>
          </div>

          {/* LoRA Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lora-strength">LoRA Strength</Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.strength?.toFixed(2) || 0.75}
              </span>
            </div>
            <Slider
              id="lora-strength"
              min={0}
              max={1}
              step={0.05}
              value={[localSettings.strength || 0.75]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, strength: value })
              }
            />
          </div>

          <Separator />

          {/* Style Preset */}
          <div className="space-y-2">
            <Label htmlFor="style-preset">Style Preset</Label>
            <Select
              value={localSettings.stylePreset || 'none'}
              onValueChange={(value) =>
                setLocalSettings({
                  ...localSettings,
                  stylePreset: value === 'none' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="style-preset">
                <SelectValue placeholder="Select a style preset" />
              </SelectTrigger>
              <SelectContent>
                {presetStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <Label htmlFor="negative-prompt">Negative Prompt</Label>
            <Textarea
              id="negative-prompt"
              placeholder="Elements to avoid in the generation..."
              value={localSettings.negativePrompt || ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, negativePrompt: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>

          <Separator />

          {/* CFG Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cfg-scale">
                CFG Scale
                <span className="text-xs text-muted-foreground ml-2">
                  (Guidance strength)
                </span>
              </Label>
              <span className="text-sm text-muted-foreground">
                {localSettings.cfgScale || 7}
              </span>
            </div>
            <Slider
              id="cfg-scale"
              min={1}
              max={20}
              step={0.5}
              value={[localSettings.cfgScale || 7]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, cfgScale: value })
              }
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <Label htmlFor="seed">Seed</Label>
            <div className="flex gap-2">
              <Input
                id="seed"
                type="number"
                placeholder="Random"
                value={localSettings.seed || ''}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    seed: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleRandomSeed}
                title="Generate random seed"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use a specific seed for reproducible results
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Sparkles className="mr-2 h-4 w-4" />
              Apply Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}