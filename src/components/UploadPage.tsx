'use client';

import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
	Upload,
	FileText,
	X,
	FolderOpen,
	Sparkles,
	Zap,
	Shield,
	Clock,
	CheckCircle2,
} from 'lucide-react';

interface UploadPageProps {
	onFilesUploaded: (
		files: File[],
		documentId?: string
	) => void;
}

export default function UploadPage({
	onFilesUploaded,
}: UploadPageProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStatus, setProcessingStatus] =
		useState<string>('');
	const [processedDocumentId, setProcessedDocumentId] =
		useState<string>('');

	const onDrop = useCallback(
		(
			acceptedFiles: File[],
			rejectedFiles: FileRejection[]
		) => {
			// Only accept the first file if multiple are dropped
			if (acceptedFiles.length > 0) {
				setFiles([acceptedFiles[0]]);
			}

			// Show feedback for rejected files
			if (rejectedFiles.length > 0) {
				console.warn(
					'Some files were rejected:',
					rejectedFiles
				);
			}
		},
		[]
	);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragReject,
	} = useDropzone({
		onDrop,
		accept: {
			'application/pdf': ['.pdf'],
		},
		multiple: false, // Only allow one file
		maxSize: 10 * 1024 * 1024, // 10MB
	});

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const processPDF = async (
		file: File
	): Promise<string> => {
		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch('/api/process-pdf', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				error.error || 'Failed to process PDF'
			);
		}

		const result = await response.json();
		return result.data.documentId;
	};

	const handleSubmit = async () => {
		if (files.length > 0) {
			setIsProcessing(true);
			setProcessingStatus('Processing PDF...');

			try {
				// Process the single PDF file
				const file = files[0];
				setProcessingStatus(`Processing ${file.name}...`);

				const documentId = await processPDF(file);
				setProcessedDocumentId(documentId);
				setProcessingStatus('PDF processed successfully!');

				// Small delay to show success message
				setTimeout(() => {
					onFilesUploaded(files, documentId);
				}, 1000);
			} catch (error) {
				console.error('Error processing PDF:', error);
				setProcessingStatus(
					`Error: ${
						error instanceof Error
							? error.message
							: 'Failed to process PDF'
					}`
				);
				setIsProcessing(false);
			}
		}
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return (
			Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
			' ' +
			sizes[i]
		);
	};

	return (
		<div className="h-full flex flex-col bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
			<div className="flex-1 p-4 overflow-y-auto">
				<div className="max-w-4xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-8">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="flex items-center justify-center gap-4 mb-6">
							<div className="relative">
								<div className="p-3 bg-gradient-to-br from-[#1f6feb] to-[#0969da] rounded-xl shadow-lg">
									<Sparkles
										className="text-white"
										size={24}
									/>
								</div>
								<div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#a5d6ff] to-[#d2a8ff] rounded-full animate-pulse"></div>
							</div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-[#e6edf3] to-[#a5d6ff] bg-clip-text text-transparent">
								PDF Chat Assistant
							</h1>
						</motion.div>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="text-base text-[#7d8590] max-w-2xl mx-auto leading-relaxed">
							Transform your PDF into an intelligent
							conversation partner. Upload a document and
							get instant, contextual answers powered by AI.
						</motion.p>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="glass-card mb-8 p-8">
						<div
							{...getRootProps()}
							className={`
								border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
								transition-all duration-300 relative overflow-hidden
								${
									isDragActive
										? 'border-[#1f6feb] bg-gradient-to-br from-[#1f6feb]/10 to-[#0969da]/5 scale-105'
										: isDragReject
										? 'border-[#ff5f56] bg-gradient-to-br from-[#ff5f56]/10 to-[#ff5f56]/5'
										: 'border-[#30363d] hover:border-[#1f6feb] hover:bg-gradient-to-br hover:from-[#1f6feb]/5 hover:to-[#0969da]/5'
								}
							`}>
							<input {...getInputProps()} />

							{/* Animated background pattern */}
							<div className="absolute inset-0 opacity-5">
								<div className="absolute top-4 left-4 w-8 h-8 border border-[#1f6feb] rounded-full animate-pulse"></div>
								<div className="absolute top-8 right-8 w-4 h-4 bg-[#a5d6ff] rounded-full animate-bounce"></div>
								<div className="absolute bottom-6 left-8 w-6 h-6 border border-[#d2a8ff] rounded-full animate-pulse"></div>
								<div className="absolute bottom-4 right-4 w-3 h-3 bg-[#1f6feb] rounded-full animate-bounce"></div>
							</div>

							<motion.div
								animate={
									isDragActive
										? { scale: 1.1, rotate: 5 }
										: { scale: 1, rotate: 0 }
								}
								transition={{ duration: 0.3 }}
								className="relative z-10">
								<div className="p-4 bg-gradient-to-br from-[#1f6feb] to-[#0969da] rounded-2xl mx-auto w-fit mb-6 shadow-lg">
									<Upload
										className="text-white"
										size={28}
									/>
								</div>

								<h3 className="text-xl font-bold text-[#e6edf3] mb-3">
									{isDragActive
										? '🎉 Drop your PDF here!'
										: isDragReject
										? '❌ Invalid file type'
										: '📄 Drag & drop a PDF file here'}
								</h3>

								<p className="text-base text-[#7d8590] mb-6">
									or click to browse your files
								</p>

								<div className="flex items-center justify-center gap-2 text-sm text-[#7d8590] bg-[#0d1117] rounded-lg p-3 border border-[#21262d]">
									<FileText size={16} />
									<span>
										Supports one PDF file up to 10MB
									</span>
								</div>
							</motion.div>
						</div>

						{files.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4 }}
								className="mt-8">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-2 bg-gradient-to-br from-[#1f6feb] to-[#0969da] rounded-lg">
										<FolderOpen
											className="text-white"
											size={18}
										/>
									</div>
									<h3 className="text-lg font-bold text-[#e6edf3]">
										Selected PDF
									</h3>
								</div>
								<div className="space-y-3">
									{files.map((file, index) => (
										<motion.div
											key={`${file.name}-${index}`}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{
												duration: 0.3,
												delay: index * 0.1,
											}}
											className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0d1117] to-[#161b22] rounded-xl border border-[#21262d] hover:border-[#1f6feb]/40 hover:shadow-lg transition-all duration-300 group">
											<div className="flex items-center gap-3">
												<div className="p-2 bg-gradient-to-br from-[#1f6feb]/20 to-[#0969da]/20 rounded-lg">
													<FileText
														className="text-[#1f6feb]"
														size={18}
													/>
												</div>
												<div>
													<p className="text-sm font-semibold text-[#e6edf3] group-hover:text-white transition-colors">
														{file.name}
													</p>
													<p className="text-xs text-[#7d8590] flex items-center gap-1">
														<Clock size={12} />
														{formatFileSize(file.size)}
													</p>
												</div>
											</div>
											<motion.button
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
												onClick={() => removeFile(index)}
												className="p-2 hover:bg-[#ff5f56]/20 rounded-lg transition-colors group">
												<X
													className="text-[#7d8590] hover:text-[#ff5f56] transition-colors"
													size={16}
												/>
											</motion.button>
										</motion.div>
									))}
								</div>
							</motion.div>
						)}
					</motion.div>

					{files.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="flex flex-col items-center mt-8 gap-4">
							{processingStatus && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="text-center">
									<div className="flex items-center gap-2 text-[#7d8590] mb-2">
										{isProcessing ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1f6feb]"></div>
												<span className="text-sm">
													{processingStatus}
												</span>
											</>
										) : (
											<>
												<CheckCircle2
													className="text-green-500"
													size={16}
												/>
												<span className="text-sm text-green-500">
													{processingStatus}
												</span>
											</>
										)}
									</div>
								</motion.div>
							)}
							<motion.button
								whileHover={
									!isProcessing ? { scale: 1.05 } : {}
								}
								whileTap={
									!isProcessing ? { scale: 0.95 } : {}
								}
								onClick={handleSubmit}
								disabled={isProcessing}
								className={`px-8 py-4 text-base font-bold rounded-xl flex items-center gap-3 shadow-lg transition-all duration-300 ${
									isProcessing
										? 'bg-[#30363d] text-[#7d8590] cursor-not-allowed'
										: 'bg-gradient-to-r from-[#1f6feb] to-[#0969da] hover:from-[#0969da] hover:to-[#1f6feb] text-white hover:shadow-xl'
								}`}>
								{isProcessing ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7d8590]"></div>
										Processing...
									</>
								) : (
									<>
										<Zap className="text-white" size={20} />
										Process PDF
										<CheckCircle2
											className="text-white"
											size={16}
										/>
									</>
								)}
							</motion.button>
						</motion.div>
					)}

					{/* Features Section */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
							<div className="p-3 bg-gradient-to-br from-[#a5d6ff] to-[#1f6feb] rounded-xl mx-auto w-fit mb-4">
								<Sparkles
									className="text-white"
									size={20}
								/>
							</div>
							<h3 className="text-lg font-bold text-[#e6edf3] mb-2">
								AI-Powered
							</h3>
							<p className="text-sm text-[#7d8590]">
								Advanced AI understands your document
								context and provides intelligent responses
							</p>
						</div>

						<div className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
							<div className="p-3 bg-gradient-to-br from-[#d2a8ff] to-[#a5d6ff] rounded-xl mx-auto w-fit mb-4">
								<Shield className="text-white" size={20} />
							</div>
							<h3 className="text-lg font-bold text-[#e6edf3] mb-2">
								Secure & Private
							</h3>
							<p className="text-sm text-[#7d8590]">
								Your document is processed securely with
								privacy protection
							</p>
						</div>

						<div className="glass-card p-6 text-center group hover:scale-105 transition-transform duration-300">
							<div className="p-3 bg-gradient-to-br from-[#ffa657] to-[#d2a8ff] rounded-xl mx-auto w-fit mb-4">
								<Zap className="text-white" size={20} />
							</div>
							<h3 className="text-lg font-bold text-[#e6edf3] mb-2">
								Lightning Fast
							</h3>
							<p className="text-sm text-[#7d8590]">
								Get instant answers and insights from your
								document
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
