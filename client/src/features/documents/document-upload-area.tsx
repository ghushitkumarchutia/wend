import { useState } from 'react';
import { File as FileIcon, X } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloudUploadIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocumentUploadAreaProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export function DocumentUploadArea({ onFileSelect, disabled }: DocumentUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, JPEG, PNG, or DOC.');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
  };

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-4 border border-neutral-200/60 rounded-2xl bg-neutral-50/50">
        <div className="flex items-center space-x-3 truncate">
          <FileIcon className="h-6 w-6 text-[#09a474] shrink-0 stroke-1.5" />
          <div className="truncate">
            <p className="text-sm font-medium text-neutral-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-neutral-400 font-light mt-0.5">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFile}
          disabled={disabled}
          className="text-neutral-400 hover:text-red-500 hover:bg-neutral-100/60 rounded-lg p-1.5"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
        dragActive
          ? 'border-[#09a474] bg-[#09a474]/5'
          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        disabled={disabled}
        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
        <div className="p-3 bg-[#09a474]/10 rounded-2xl flex items-center justify-center">
          <HugeiconsIcon icon={CloudUploadIcon} className="w-6 h-6 text-[#09a474]" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium font-manrope text-neutral-800">Click to upload or drag and drop</p>
          <p className="text-xs text-neutral-400 font-manrope font-light mt-1">PDF, JPG, PNG, DOC (max. 5MB)</p>
        </div>
      </div>
    </div>
  );
}
