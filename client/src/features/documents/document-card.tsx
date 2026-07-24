import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, Delete01Icon, Alert02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { documentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripDocument } from '@/types/models';
import { DeleteDocumentDialog } from './delete-document-dialog';
import tabSvg from '@/assets/svg/tab.svg';

interface DocumentCardProps {
  tripId: string;
  document: TripDocument;
  isOrganizerOrMember: boolean;
  currentUserId?: string;
  userRole?: string;
}

function getDocumentTypeTheme(fileType: string) {
  if (fileType.startsWith('image/')) {
    const ext = fileType.split('/')[1]?.toUpperCase() || 'IMAGE';
    return {
      label: ext,
      categoryBg: '#F3F8FF',
      pillBorder: 'rgba(37, 99, 235, 0.2)',
      accent: '#2563EB',
    };
  }
  if (fileType === 'application/pdf') {
    return {
      label: 'PDF',
      categoryBg: '#FFF5F5',
      pillBorder: 'rgba(225, 29, 72, 0.2)',
      accent: '#E11D48',
    };
  }
  const ext = fileType.split('/')[1]?.toUpperCase() || 'FILE';
  return {
    label: ext,
    categoryBg: '#F7F7FA',
    pillBorder: 'rgba(100, 116, 139, 0.2)',
    accent: '#4B5563',
  };
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

  const theme = getDocumentTypeTheme(document.fileType);
  const uploaderName = document.uploadedBy?.name
    ? document.uploadedBy.name.trim().split(/\s+/)[0]
    : 'Unknown';
  const formattedDate = format(new Date(document.createdAt), 'MMM d, yyyy');

  return (
    <>
      <div className="relative w-full h-full mt-5 md:mt-6.75 font-manrope">
        <div
          aria-hidden="true"
          className="absolute -top-5.5 md:-top-6.75 left-0 h-7 md:h-9 w-48 md:w-58.75 max-w-[70%] pointer-events-none z-10"
          style={{
            backgroundColor: '#FFFFFF',
            WebkitMaskImage: `url(${tabSvg})`,
            maskImage: `url(${tabSvg})`,
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskPosition: 'left top',
            maskPosition: 'left top',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
          }}
        />

        <div className="absolute -top-2.75 md:-top-3.5 left-2.5 md:left-3.5 z-20 pointer-events-none select-none">
          <div
            className="relative inline-flex items-center justify-center px-2.5 md:px-3 py-1 rounded-full border border-white/90 backdrop-blur-md transition-all"
            style={{
              background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.categoryBg} 100%)`,
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                0 4px 12px -2px rgba(0, 0, 0, 0.08),
                0 1px 3px 0 ${theme.pillBorder}
              `,
            }}
          >
            <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

            <span
              className="font-syne text-[8.5px] md:text-[9.5px] font-semibold uppercase tracking-wider leading-none relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
              style={{ color: theme.accent }}
            >
              {theme.label}
            </span>
          </div>
        </div>

        <div className="relative w-full rounded-3xl rounded-tl-none p-1 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between select-none">
          <div
            className="w-full rounded-2xl px-3.5 md:px-4 pt-4 md:pt-4.5 pb-3.5 md:pb-4 space-y-2.5 flex flex-col justify-between transition-colors"
            style={{
              background: `linear-gradient(to top, ${theme.categoryBg} 0%, #FFFFFF 100%)`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4
                  className="font-syne font-semibold text-neutral-900 text-sm md:text-[15px] tracking-tight truncate leading-snug"
                  title={document.fileName}
                >
                  {document.fileName}
                </h4>
              </div>

              {document.visibility === 'private' && (
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-700 border-amber-500/25 text-[10px] py-0.5 px-2 rounded-full font-semibold font-manrope shrink-0 flex items-center gap-1"
                >
                  <HugeiconsIcon icon={Alert02Icon} className="w-3 h-3" strokeWidth={2} />
                  <span>Private</span>
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 text-xs font-manrope py-0.5">
              <div className="flex justify-between items-center text-[11px] md:text-xs">
                <span className="text-neutral-400 font-medium tracking-wide">File Size</span>
                <span className="font-semibold text-neutral-800 font-manrope">
                  {formatFileSize(document.sizeBytes)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] md:text-xs">
                <span className="text-neutral-400 font-medium tracking-wide">Uploaded By</span>
                <span className="font-semibold text-neutral-800 font-manrope">{uploaderName}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] md:text-xs">
                <span className="text-neutral-400 font-medium tracking-wide">Uploaded On</span>
                <span className="font-semibold text-neutral-800 font-manrope">{formattedDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 flex items-center gap-2">
              <Button
                size="sm"
                variant="waterdrop"
                onClick={handleDownload}
                disabled={isDownloading}
                className="h-8.5 w-8.5 p-0 text-white cursor-pointer shrink-0 rounded-full!"
                style={{
                  background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                    0 4px 12px -2px rgba(16, 185, 129, 0.4),
                    0 1px 3px 0 rgba(0, 0, 0, 0.08)
                  `,
                }}
                title="View document"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <HugeiconsIcon icon={ViewIcon} className="w-4.5 h-4.5" strokeWidth={1.75} />
                )}
              </Button>

              {canDelete && (
                <Button
                  size="sm"
                  variant="waterdrop"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8.5 w-8.5 p-0 text-white cursor-pointer shrink-0 rounded-full!"
                  style={{
                    background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                      inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                      0 4px 14px -2px rgba(230, 57, 70, 0.4),
                      0 1px 3px 0 rgba(0, 0, 0, 0.08)
                    `,
                  }}
                  title="Delete Document"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" strokeWidth={1.75} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

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
