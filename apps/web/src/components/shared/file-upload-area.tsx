import { useCallback, useState, useRef } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadAreaProps {
  accept?: string;
  maxSizeBytes?: number;
  onUpload: (file: File) => Promise<void>;
  className?: string;
}

export function FileUploadArea({
  accept,
  maxSizeBytes = 10 * 1024 * 1024,
  onUpload,
  className,
}: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.size > maxSizeBytes) {
        setError(`File size exceeds ${Math.round(maxSizeBytes / 1024 / 1024)}MB limit`);
        return;
      }

      setSelectedFile(file);
      setUploading(true);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        await onUpload(file);
        setProgress(100);
      } catch {
        setError('Upload failed. Please try again.');
      } finally {
        clearInterval(interval);
        setUploading(false);
        setTimeout(() => {
          setSelectedFile(null);
          setProgress(0);
        }, 1000);
      }
    },
    [maxSizeBytes, onUpload],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!selectedFile && (
        <div className="flex flex-col items-center gap-2">
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drag & drop a file here</p>
          <p className="text-xs text-muted-foreground">
            or{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              browse
            </button>{' '}
            to upload (max {Math.round(maxSizeBytes / 1024 / 1024)}MB)
          </p>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center gap-3">
          <FileIcon className="size-8 shrink-0 text-muted-foreground" />
          <div className="flex-1 text-left">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
            {uploading && <Progress value={progress} className="mt-1.5 h-1.5" />}
          </div>
          {!uploading && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setSelectedFile(null)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
