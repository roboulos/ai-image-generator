'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChatMessage, ImageMetadata } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Images,
  Search,
  Download,
  Trash2,
  Heart,
  Tag,
  Calendar,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Copy,
  ExternalLink,
  Folder,
  CheckSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImageGalleryProps {
  messages: ChatMessage[];
  onDelete?: (messageId: string) => void;
  onFavorite?: (messageId: string) => void;
  onAddToCollection?: (messageId: string, collection: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date-desc' | 'date-asc' | 'prompt';

export function ImageGallery({ messages, onDelete, onFavorite, onAddToCollection }: ImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Filter messages that have images
  const imageMessages = messages.filter(msg => msg.image);

  // Apply search filter
  const filteredMessages = imageMessages.filter(msg =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return b.timestamp.getTime() - a.timestamp.getTime();
      case 'date-asc':
        return a.timestamp.getTime() - b.timestamp.getTime();
      case 'prompt':
        return a.content.localeCompare(b.content);
      default:
        return 0;
    }
  });

  const handleSelectImage = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === sortedMessages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(sortedMessages.map(msg => msg.id)));
    }
  };

  const handleDownload = (image: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  };

  const handleCopyImage = async (image: string) => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      toast.success('Image copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy image');
    }
  };

  const handleBulkDelete = () => {
    selectedImages.forEach(id => {
      onDelete?.(id);
    });
    setSelectedImages(new Set());
    setSelectionMode(false);
  };

  const ImageItem = ({ message }: { message: ChatMessage }) => {
    const isSelected = selectedImages.has(message.id);
    const userMessage = messages.find(m => 
      m.role === 'user' && 
      messages.indexOf(m) === messages.indexOf(message) - 1
    );

    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg border bg-card transition-all',
          viewMode === 'grid' ? 'aspect-square' : '',
          isSelected && 'ring-2 ring-primary',
          selectionMode && 'cursor-pointer'
        )}
        onClick={() => selectionMode && handleSelectImage(message.id)}
      >
        {/* Selection checkbox */}
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div className={cn(
              'h-5 w-5 rounded border-2 bg-background',
              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}>
              {isSelected && <CheckSquare className="h-4 w-4 text-primary-foreground" />}
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <>
            <img
              src={message.image!.url}
              alt={userMessage?.content || 'Generated image'}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs text-white line-clamp-2">
                  {userMessage?.content || 'No prompt'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/70">
                    {message.timestamp.toLocaleDateString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(message.image!.url, userMessage?.content || '');
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-white hover:bg-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyImage(message.image!.url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Image
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onFavorite?.(message.id)}>
                          <Heart className="mr-2 h-4 w-4" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddToCollection?.(message.id, 'default')}>
                          <Folder className="mr-2 h-4 w-4" />
                          Add to Collection
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete?.(message.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4 p-4">
            <img
              src={message.image!.url}
              alt={userMessage?.content || 'Generated image'}
              className="h-20 w-20 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userMessage?.content || 'No prompt'}
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span>{message.timestamp.toLocaleDateString()}</span>
                {message.image?.size && <span>{message.image.size}</span>}
                {message.image?.style && <Badge variant="secondary">{message.image.style}</Badge>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(message.image!.url, userMessage?.content || '');
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCopyImage(message.image!.url)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Image
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFavorite?.(message.id)}>
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddToCollection?.(message.id, 'default')}>
                    <Folder className="mr-2 h-4 w-4" />
                    Add to Collection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete?.(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Images className="h-4 w-4" />
        Gallery
        {imageMessages.length > 0 && (
          <Badge variant="secondary">{imageMessages.length}</Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="prompt">Prompt A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {selectionMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedImages.size === sortedMessages.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedImages.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                    >
                      Delete ({selectedImages.size})
                    </Button>
                  )}
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedImages(new Set());
                }}
              >
                {selectionMode ? 'Cancel' : 'Select'}
              </Button>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="all">All Images</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="all" className="m-0">
                <div className={cn(
                  viewMode === 'grid' 
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-2'
                )}>
                  {sortedMessages.map((message) => (
                    <ImageItem key={message.id} message={message} />
                  ))}
                </div>
                {sortedMessages.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No images found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="m-0">
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Favorites coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="collections" className="m-0">
                <div className="text-center py-12 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Collections coming soon</p>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>{sortedMessages.length} images</span>
            <span>{selectedImages.size} selected</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}