import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a file to the trip workspace. Shared documents are visible to everyone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <DocumentUploadArea onFileSelect={setFile} disabled={isSubmitting} />

          {file && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                <Label htmlFor="doc-name">File Name (Optional)</Label>
                <Input
                  id="doc-name"
                  placeholder={file.name}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc-category">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(val) => setCategory(val as DocumentCategory)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-visibility">Visibility</Label>
                  <Select
                    value={visibility}
                    onValueChange={(val) => setVisibility(val as DocumentVisibility)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="doc-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 mt-2">
            <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
