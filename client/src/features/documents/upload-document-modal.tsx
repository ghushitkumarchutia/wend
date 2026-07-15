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

      // Step 3: Confirm upload with backend
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
        className="sm:max-w-[440px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
          <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
            Upload Document
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400 font-light text-center">
            Add a file to the trip workspace. Shared documents are visible to everyone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-0 mt-4">
          <DocumentUploadArea onFileSelect={setFile} disabled={isSubmitting} />

          {file && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-1">
                <Label
                  htmlFor="doc-name"
                  className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
                >
                  File Name (Optional)
                </Label>
                <Input
                  id="doc-name"
                  placeholder={file.name}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isSubmitting}
                  className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="doc-category"
                    className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
                  >
                    Category
                  </Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as DocumentCategory)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="doc-category"
                      className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
                    >
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
                      {['flight', 'hotel', 'booking', 'visa', 'insurance', 'other'].map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! capitalize ${
                            cat === category
                              ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                              : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                          }`}
                        >
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="doc-visibility"
                    className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
                  >
                    Visibility
                  </Label>
                  <Select
                    value={visibility}
                    onValueChange={(val) => setVisibility(val as DocumentVisibility)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger
                      id="doc-visibility"
                      className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
                      {[
                        { label: 'Shared', value: 'shared' },
                        { label: 'Private', value: 'private' },
                      ].map((vis) => (
                        <SelectItem
                          key={vis.value}
                          value={vis.value}
                          className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                            vis.value === visibility
                              ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                              : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                          }`}
                        >
                          {vis.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || isSubmitting}
              className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
            >
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
