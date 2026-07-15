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
import { DeleteDocumentDialog } from './delete-document-dialog';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
      return <FileImage className="h-7 w-7 text-sky-500 stroke-1" />;
    if (document.fileType === 'application/pdf')
      return <FileText className="h-7 w-7 text-rose-500 stroke-1" />;
    return <File className="h-7 w-7 text-neutral-500 stroke-1" />;
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

  const handleDeleteConfirm = async () => {
    try {
      await documentsApi.deleteDocument(tripId, document.id);
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
    } catch {
      toast.error('Failed to delete document');
      throw new Error('Failed to delete');
    }
  };

  return (
    <>
      <Card className="relative group transition-all duration-200 ring-0 border border-neutral-200/70 rounded-xl bg-white shadow-2xs overflow-hidden flex flex-col hover:border-[#09a474]/40 hover:shadow-xs cursor-pointer">
        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-neutral-100/60 rounded-xl shrink-0">{getFileIcon()}</div>
            {document.visibility === 'private' && (
              <Badge
                variant="outline"
                className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs py-0.5 px-2 rounded-md"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1 stroke-1.5" /> Private
              </Badge>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4
              className="font-semibold text-neutral-900 text-sm sm:text-[15px] tracking-tight leading-snug truncate"
              title={document.fileName}
            >
              {document.fileName}
            </h4>
            <p className="text-xs text-neutral-400 font-normal mt-1">
              {formatFileSize(document.sizeBytes)} •{' '}
              {document.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400 font-normal">
            <span className="truncate pr-2">By {document.uploadedBy?.name ? document.uploadedBy.name.split(' ')[0] : 'Unknown'}</span>
            <span className="shrink-0">{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
          </div>

          <div className="absolute inset-0 bg-white/90 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#2c6e49] hover:bg-[#23583a] text-white font-medium rounded-lg h-9 px-3 text-xs cursor-pointer shadow-xs transition-all duration-200 border-none flex items-center"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 mr-1.5 stroke-[2.2]" />
              )}
              {isDownloading ? 'Opening...' : 'Open'}
            </Button>
            {canDelete && (
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg h-9 w-9 p-0 cursor-pointer shadow-xs transition-all duration-200 border-none flex items-center justify-center"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash className="w-4 h-4 stroke-[1.8]" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isDeleteDialogOpen && (
        <DeleteDocumentDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          documentName={document.fileName}
        />
      )}
    </>
  );
}
