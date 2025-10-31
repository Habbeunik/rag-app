'use client';

import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { extractPDFText } from '@/lib/pdf-utils';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UploadPageProps {
  onFilesUploaded: (files: File[], documentId?: string) => void;
}

export default function UploadPage({ onFilesUploaded }: UploadPageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        setFiles([acceptedFiles[0]]);
      }
      if (rejectedFiles.length > 0) {
        console.warn('Some files were rejected:', rejectedFiles);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        'application/pdf': ['.pdf'],
      },
      multiple: false,
      maxSize: 10 * 1024 * 1024,
    });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processPDF = async (file: File): Promise<string> => {
    setProcessingStatus('Extracting text from PDF...');
    const text = await extractPDFText(file);

    setProcessingStatus('Processing and creating embeddings...');
    const response = await fetch('/api/process-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename: file.name,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process PDF');
    }

    const result = await response.json();
    return result.data.documentId;
  };

  const handleSubmit = async () => {
    if (files.length > 0) {
      setIsProcessing(true);
      setProcessingStatus('Processing PDF...');

      try {
        const file = files[0];
        setProcessingStatus(`Processing ${file.name}...`);

        const documentId = await processPDF(file);
        setProcessingStatus('PDF processed successfully!');

        setTimeout(() => {
          onFilesUploaded(files, documentId);
        }, 1000);
      } catch (error) {
        console.error('Error processing PDF:', error);
        setProcessingStatus(
          `Error: ${
            error instanceof Error ? error.message : 'Failed to process PDF'
          }`
        );
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-end p-6">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">
              PDF Chat Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              Upload a PDF and chat with your document
            </p>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-foreground bg-accent'
                : isDragReject
                ? 'border-destructive bg-destructive/10'
                : 'border-border hover:border-foreground/50 hover:bg-accent/50'
            )}
          >
            <input {...getInputProps()} />
            <Upload
              className={cn(
                'mx-auto mb-6 transition-colors',
                isDragActive ? 'text-foreground' : 'text-muted-foreground'
              )}
              size={48}
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-semibold mb-3">
              {isDragActive
                ? 'Drop your PDF here'
                : isDragReject
                ? 'Invalid file type'
                : 'Drop PDF here'}
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              PDF files up to 10MB
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{files[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(files[0].size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(0)}
                  className="shrink-0 ml-4"
                >
                  <X size={18} />
                </Button>
              </div>

              {processingStatus && (
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  {isProcessing && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{processingStatus}</span>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                size="lg"
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Start Chat'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
