import { formatDistanceToNow } from 'date-fns';
import { FileText, ImageIcon, Download, Eye, MoreVertical, Trash2, Lock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DocumentWithMeta, MemberWithUser } from '@wend/shared';

interface DocumentRowProps {
  document: DocumentWithMeta;
  members: MemberWithUser[];
  currentUserId: string;
  userRole: 'organizer' | 'member' | 'viewer';
  onDownload: (doc: DocumentWithMeta) => void;
  onPreview: (doc: DocumentWithMeta) => void;
  onDelete: (doc: DocumentWithMeta) => void;
  onImageClick?: (doc: DocumentWithMeta) => void;
}

const DOC_CATEGORY_LABELS: Record<string, string> = {
  flight: 'Flight',
  hotel: 'Hotel',
  visa: 'Visa',
  insurance: 'Insurance',
  booking: 'Booking',
  other: 'Other',
};

function isImageType(fileType: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(fileType);
}

function isPdfType(fileType: string): boolean {
  return fileType === 'application/pdf';
}

function getUploader(doc: DocumentWithMeta, members: MemberWithUser[]): string {
  const member = members.find((m) => m.userId === doc.uploadedByUserId);
  return member?.user.name ?? 'Unknown';
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentRow({
  document: doc,
  members,
  currentUserId,
  userRole,
  onDownload,
  onPreview,
  onDelete,
  onImageClick,
}: DocumentRowProps) {
  const isImage = isImageType(doc.fileType);
  const isPdf = isPdfType(doc.fileType);
  const uploaderName = getUploader(doc, members);
  const isOwner = doc.uploadedByUserId === currentUserId;
  const isOrganizer = userRole === 'organizer';
  const canDelete = isOwner || isOrganizer;
  const isPrivate = doc.visibility === 'private';

  return (
    <div className="group flex items-center gap-3 rounded-lg border bg-card p-3">
      {isImage ? (
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted"
          onClick={() => onImageClick?.(doc)}
        >
          <ImageIcon className="size-5 text-muted-foreground" />
        </button>
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{doc.fileName}</p>
          {doc.category && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {DOC_CATEGORY_LABELS[doc.category] ?? doc.category}
            </Badge>
          )}
          {isPrivate && isOwner && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
              <Lock className="size-2.5" />
              Private
            </Badge>
          )}
          {!isPrivate && (
            <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
              <Globe className="size-2.5" />
              Shared
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Uploaded by {uploaderName} · {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })} · {formatBytes(doc.sizeBytes)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isPdf && (
          <Button variant="ghost" size="icon-xs" onClick={() => onPreview(doc)} title="Preview">
            <Eye className="size-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon-xs" onClick={() => onDownload(doc)} title="Download">
          <Download className="size-3.5" />
        </Button>
        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="opacity-0 transition-opacity group-hover:opacity-100">
                <MoreVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(doc)}
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete document
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
