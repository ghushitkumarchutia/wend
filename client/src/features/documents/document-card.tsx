import { FileText, Download, Trash, FileImage, File, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { documentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripDocument } from '@/types/models';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DocumentCardProps {
  tripId: string;
  document: TripDocument;
  isOrganizerOrMember: boolean;
  currentUserId?: string;
  userRole?: string;
}

export function DocumentCard({
  tripId,
  document,
  isOrganizerOrMember,
  currentUserId,
  userRole,
}: DocumentCardProps) {
  const queryClient = useQueryClient();
  const [isDownloading, setIsDownloading] = useState(false);

  const canDelete =
    isOrganizerOrMember &&
    (document.uploadedByUserId === currentUserId || userRole === 'organizer');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (document.fileType.startsWith('image/'))
      return <FileImage className="h-8 w-8 text-blue-500" />;
    if (document.fileType === 'application/pdf')
      return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await documentsApi.getDownloadUrl(tripId, document.id);
      const url = res.data.url;

      window.open(url, '_blank');
    } catch {
      toast.error('Failed to get download link');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsApi.deleteDocument(tripId, document.id);
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
    } catch {
      toast.error('Failed to delete document');
    }
  };

  return (
    <Card className="hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-muted rounded-md shrink-0">{getFileIcon()}</div>
          {document.visibility === 'private' && (
            <Badge
              variant="outline"
              className="bg-orange-500/10 text-orange-600 border-orange-500/20"
            >
              <ShieldAlert className="w-3 h-3 mr-1" /> Private
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <h4
            className="font-semibold text-sm line-clamp-2 wrap-break-word"
            title={document.fileName}
          >
            {document.fileName}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {formatFileSize(document.sizeBytes)} •{' '}
            {document.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate pr-2">By {document.uploadedBy?.name || 'Unknown'}</span>
          <span className="shrink-0">{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
        </div>

        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Opening...' : 'Open'}
          </Button>
          {canDelete && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
