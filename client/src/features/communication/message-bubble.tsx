import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types/models';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  tripId: string;
}

export function MessageBubble({ message, isOwn, tripId }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(message.body);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (editBody.trim() === message.body || !editBody.trim()) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await chatApi.editMessage(tripId, message.id, { body: editBody.trim() });
      setIsEditing(false);
    } catch {
      toast.error('Failed to edit message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await chatApi.deleteMessage(tripId, message.id);
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const initials = message.user?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className={`flex gap-3 w-full group ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 shrink-0 mt-1">
        <AvatarImage src={message.user?.image || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
      </Avatar>

      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-medium text-foreground">
            {message.user?.name || 'User'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
          {message.editedAt && (
            <span className="text-[10px] text-muted-foreground italic">(edited)</span>
          )}
        </div>

        <div className="relative group/bubble flex items-center">
          <div
            className={`px-3 py-2 rounded-2xl text-sm wrap-break-word relative
              ${
                isOwn
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted text-foreground rounded-tl-sm'
              }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-2 min-w-[200px]">
                <input
                  autoFocus
                  className="bg-background text-foreground border rounded px-2 py-1 text-sm w-full outline-none"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit();
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditBody(message.body);
                    }
                  }}
                  disabled={isSubmitting}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                  onClick={handleEdit}
                  disabled={isSubmitting}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.body}</p>
            )}
          </div>

          {!isEditing && isOwn && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="h-6 w-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
