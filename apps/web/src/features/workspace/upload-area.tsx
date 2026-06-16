import { useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, AlertCircle, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api-client';
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@wend/shared';

interface UploadAreaProps {
  tripId: string;
  disabled?: boolean;
}

interface UploadItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'confirming' | 'done' | 'error';
  progress: number;
  error?: string;
  category?: string;
  visibility: 'shared' | 'private';
}

const ALL_ALLOWED = [...new Set([...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES])];

function isAllowedType(file: File): boolean {
  return ALL_ALLOWED.includes(file.type as (typeof ALL_ALLOWED)[number]);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadArea({ tripId, disabled }: UploadAreaProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const updateUpload = useCallback((id: string, update: Partial<UploadItem>) => {
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...update } : u)));
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  async function uploadFile(item: UploadItem) {
    const { file, id } = item;

    updateUpload(id, { status: 'uploading', progress: 10 });

    try {
      const urlRes = await api.post<{ data: { url: string; key: string } }>(
        `/api/v1/trips/${tripId}/documents/upload-url`,
        { fileName: file.name, fileType: file.type, sizeBytes: file.size },
      );

      updateUpload(id, { progress: 30 });

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const pct = 30 + Math.round((e.loaded / e.total) * 50);
            updateUpload(id, { progress: pct });
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.open('PUT', urlRes.data.url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      updateUpload(id, { status: 'confirming', progress: 85 });

      await api.post(`/api/v1/trips/${tripId}/documents/confirm`, {
        storageKey: urlRes.data.key,
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
        category: item.category,
        visibility: item.visibility,
      });

      updateUpload(id, { status: 'done', progress: 100 });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'documents'] });

      setTimeout(() => removeUpload(id), 2000);
    } catch (err) {
      updateUpload(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  }

  function processFiles(files: FileList | File[]) {
    const items: UploadItem[] = [];

    for (const file of Array.from(files)) {
      if (!isAllowedType(file)) {
        toast.error(`${file.name}: unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name}: exceeds ${formatBytes(MAX_FILE_SIZE_BYTES)} limit`);
        continue;
      }
      items.push({
        file,
        id: crypto.randomUUID(),
        status: 'pending',
        progress: 0,
        visibility: 'shared',
      });
    }

    setUploads((prev) => [...prev, ...items]);
    for (const item of items) {
      uploadFile(item);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    processFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="space-y-3">
      <div
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => { if (!disabled) fileInputRef.current?.click(); }}
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">PDF, JPG, JPEG, PNG, WEBP · Max 10MB</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{item.file.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(item.file.size)}</span>
                </div>
                {(item.status === 'uploading' || item.status === 'confirming') && (
                  <Progress value={item.progress} className="h-1.5" />
                )}
                {item.status === 'done' && (
                  <p className="text-xs text-emerald-600">Uploaded</p>
                )}
                {item.status === 'error' && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-3 text-destructive" />
                    <span className="text-xs text-destructive">{item.error}</span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => { updateUpload(item.id, { status: 'pending', progress: 0, error: undefined }); uploadFile(item); }}
                    >
                      <RotateCcw className="mr-1 size-3" />
                      Retry
                    </Button>
                  </div>
                )}
              </div>
              {item.status !== 'done' && (
                <Button size="icon-xs" variant="ghost" onClick={() => removeUpload(item.id)}>
                  <X className="size-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
