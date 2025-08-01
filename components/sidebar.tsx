'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChatSession } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Plus,
  Search,
  Star,
  Clock,
  Image,
  Settings,
  Trash2,
  Edit2,
  MoreVertical,
  FolderOpen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onToggleStar: (sessionId: string) => void;
}

export function Sidebar({
  open,
  onOpenChange,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onToggleStar,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const starredSessions = filteredSessions.filter((s) => s.starred);
  const recentSessions = filteredSessions.filter((s) => !s.starred);

  const handleRename = (sessionId: string) => {
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
      setEditingId(null);
      setEditingTitle('');
    }
  };

  const SessionItem = ({ session }: { session: ChatSession }) => {
    const isEditing = editingId === session.id;
    const imageCount = session.messages.filter((m) => m.image).length;

    return (
      <div
        className={cn(
          'group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-accent cursor-pointer',
          currentSessionId === session.id && 'bg-accent'
        )}
        onClick={() => !isEditing && onSelectSession(session.id)}
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleRename(session.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(session.id);
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setEditingTitle('');
                }
              }}
              className="h-6 px-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <p className="text-sm truncate">{session.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                {imageCount > 0 && (
                  <>
                    <Image className="h-3 w-3" />
                    <span>{imageCount}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(session.id);
            }}
          >
            <Star
              className={cn(
                'h-3 w-3',
                session.starred && 'fill-yellow-500 text-yellow-500'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(session.id);
                  setEditingTitle(session.title);
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <Button onClick={onNewSession} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="all" className="flex-1">
              All Chats
            </TabsTrigger>
            <TabsTrigger value="images" className="flex-1">
              With Images
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <TabsContent value="all" className="m-0 p-4 space-y-4">
              {starredSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Starred
                    </span>
                  </div>
                  {starredSessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              )}

              {starredSessions.length > 0 && recentSessions.length > 0 && (
                <Separator />
              )}

              {recentSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Recent
                    </span>
                  </div>
                  {recentSessions.map((session) => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              )}

              {filteredSessions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="images" className="m-0 p-4">
              {filteredSessions
                .filter((s) => s.messages.some((m) => m.image))
                .map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}