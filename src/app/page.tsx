'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadPage from '@/components/UploadPage';
import ProcessingPage from '@/components/ProcessingPage';
import ChatPage from '@/components/ChatPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export type AppState = 'upload' | 'processing' | 'chat';

export default function Home() {
	const [appState, setAppState] =
		useState<AppState>('upload');
	const [uploadedFiles, setUploadedFiles] = useState<
		File[]
	>([]);
	const [documentId, setDocumentId] = useState<string>('');

	const handleFilesUploaded = (
		files: File[],
		documentId?: string
	) => {
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
			<div className="h-screen bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] overflow-hidden">
				<AnimatePresence mode="wait">
					{appState === 'upload' && (
						<motion.div
							key="upload"
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{
								duration: 0.5,
								ease: 'easeOut',
							}}
							className="h-full overflow-y-auto">
							<UploadPage
								onFilesUploaded={handleFilesUploaded}
							/>
						</motion.div>
					)}

					{appState === 'processing' && (
						<motion.div
							key="processing"
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{
								duration: 0.5,
								ease: 'easeOut',
							}}
							className="h-full overflow-y-auto">
							<ProcessingPage files={uploadedFiles} />
						</motion.div>
					)}

					{appState === 'chat' && (
						<motion.div
							key="chat"
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{
								duration: 0.5,
								ease: 'easeOut',
							}}
							className="h-full">
							<ChatPage
								documentId={documentId}
								files={uploadedFiles}
								onStartOver={handleStartOver}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</ErrorBoundary>
	);
}
