import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { documentsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { DocumentUploadArea } from './document-upload-area';
import type { DocumentCategory, DocumentVisibility } from '@/types/models';

interface UploadDocumentModalProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const labelClass = 'text-xs font-semibold text-neutral-800 tracking-wide font-manrope select-none';

const inputClass =
  'flex items-center bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-manrope leading-normal transition-all duration-200 shadow-2xs';

export function UploadDocumentModal({ tripId, open, onOpenChange }: UploadDocumentModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [customName, setCustomName] = useState('');
  const [category, setCategory] = useState<DocumentCategory | ''>('');
  const [visibility, setVisibility] = useState<DocumentVisibility>('shared');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsSubmitting(true);

      const urlRes = await documentsApi.getUploadUrl(tripId, {
        fileType: file.type,
      });
      const { url, storageKey } = urlRes.data;

      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to storage bucket');
      }

      await documentsApi.confirmUpload(tripId, {
        storageKey,
        fileName: customName || file.name,
        fileType: file.type,
        sizeBytes: file.size,
        category: category || undefined,
        visibility,
      });

      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
      handleClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFile(null);
    setCustomName('');
    setCategory('');
    setVisibility('shared');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="md:max-w-120 rounded-3xl md:rounded-[32px] bg-white pt-5 pb-6 px-6 md:pt-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
          <DialogTitle className="text-xl md:text-2xl font-bold text-[#09a474] font-syne text-center tracking-tight">
            Upload Document
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed">
            Add a file to the trip workspace. Shared documents are visible to everyone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3.5 py-0 mt-4">
          <DocumentUploadArea onFileSelect={setFile} disabled={isSubmitting} />

          {file && (
            <div className="grid gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="doc-name" className={labelClass}>
                  File Name (Optional)
                </Label>
                <Input
                  id="doc-name"
                  placeholder={file.name}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="doc-category" className={labelClass}>
                    Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as DocumentCategory)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="doc-category"
                      className={`${inputClass} w-full cursor-pointer! flex items-center justify-between capitalize`}
                    >
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      sideOffset={8}
                      align="start"
                      alignItemWithTrigger={false}
                      className="w-full min-w-(--radix-select-trigger-width) bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl p-2 overflow-hidden ring-transparent z-50 mt-1"
                    >
                      {['flight', 'hotel', 'booking', 'visa', 'insurance', 'other'].map((cat) => {
                        const isSelected = cat === category;
                        return (
                          <SelectItem
                            key={cat}
                            value={cat}
                            className={`rounded-lg transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 capitalize font-manrope text-sm font-medium ${
                              isSelected
                                ? 'text-white! hover:text-white! focus:text-white! focus:bg-[#059669]! hover:bg-[#059669]! **:text-white! hover:**:text-white! focus:**:text-white! font-semibold border border-white/30'
                                : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                            }`}
                            style={
                              isSelected
                                ? {
                                    background:
                                      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    boxShadow: `
                                      inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4),
                                      inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2),
                                      0 3px 10px -1px rgba(16, 185, 129, 0.35)
                                    `,
                                  }
                                : undefined
                            }
                          >
                            {cat}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="doc-visibility" className={labelClass}>
                    Visibility
                  </Label>
                  <Select
                    value={visibility}
                    onValueChange={(val) => setVisibility(val as DocumentVisibility)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="doc-visibility"
                      className={`${inputClass} w-full cursor-pointer! flex items-center justify-between capitalize`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      side="bottom"
                      sideOffset={8}
                      align="start"
                      alignItemWithTrigger={false}
                      className="w-full min-w-(--radix-select-trigger-width) bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl p-2 overflow-hidden ring-transparent z-50 mt-1"
                    >
                      {[
                        { label: 'Shared', value: 'shared' },
                        { label: 'Private', value: 'private' },
                      ].map((vis) => {
                        const isSelected = vis.value === visibility;
                        return (
                          <SelectItem
                            key={vis.value}
                            value={vis.value}
                            className={`rounded-lg transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 capitalize font-manrope text-sm font-medium ${
                              isSelected
                                ? 'text-white! hover:text-white! focus:text-white! focus:bg-[#059669]! hover:bg-[#059669]! **:text-white! hover:**:text-white! focus:**:text-white! font-semibold border border-white/30'
                                : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                            }`}
                            style={
                              isSelected
                                ? {
                                    background:
                                      'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    boxShadow: `
                                      inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4),
                                      inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2),
                                      0 3px 10px -1px rgba(16, 185, 129, 0.35)
                                    `,
                                  }
                                : undefined
                            }
                          >
                            {vis.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4.5 pt-1 w-full">
            <Button
              type="button"
              variant="waterdrop"
              disabled={isSubmitting}
              onClick={handleClose}
              className="w-full flex-1 h-11 text-sm font-semibold font-manrope text-neutral-800 border border-white/90"
              style={{
                background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                  0 4px 12px -2px rgba(0, 0, 0, 0.08),
                  0 1px 3px 0 rgba(0, 0, 0, 0.05)
                `,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="waterdrop"
              disabled={!file || isSubmitting}
              className="w-full flex-1 h-11 text-sm font-semibold font-manrope text-white border border-white/30 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(16, 185, 129, 0.45),
                  0 1px 3px 0 rgba(0, 0, 0, 0.1)
                `,
              }}
            >
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
