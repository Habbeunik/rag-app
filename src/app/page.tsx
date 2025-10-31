'use client';

import { useState } from 'react';
import UploadPage from '@/components/UploadPage';
import ProcessingPage from '@/components/ProcessingPage';
import ChatPage from '@/components/ChatPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export type AppState = 'upload' | 'processing' | 'chat';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [documentId, setDocumentId] = useState<string>('');

  const handleFilesUploaded = (files: File[], documentId?: string) => {
    setUploadedFiles(files);
    if (documentId) {
      setDocumentId(documentId);
      setAppState('chat');
    } else {
      setAppState('processing');
      setTimeout(() => {
        setDocumentId('doc-' + Date.now());
        setAppState('chat');
      }, 3000);
    }
  };

  const handleStartOver = () => {
    setAppState('upload');
    setUploadedFiles([]);
    setDocumentId('');
  };

  return (
    <ErrorBoundary>
      <div className="h-screen bg-background">
        {appState === 'upload' && (
          <UploadPage onFilesUploaded={handleFilesUploaded} />
        )}
        {appState === 'processing' && (
          <ProcessingPage files={uploadedFiles} />
        )}
        {appState === 'chat' && (
          <ChatPage
            documentId={documentId}
            files={uploadedFiles}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
