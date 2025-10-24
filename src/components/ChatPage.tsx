'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
	Send,
	FileText,
	RotateCcw,
	Bot,
	MessageSquare,
	Sparkles,
	Copy,
	ThumbsUp,
	ThumbsDown,
	MoreHorizontal,
	CheckCircle2,
	AlertCircle,
	RefreshCw,
} from 'lucide-react';

interface ChatPageProps {
	documentId: string;
	files: File[];
	onStartOver: () => void;
}

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
	status?: 'sending' | 'sent' | 'error';
}

export default function ChatPage({
	documentId: _documentId, // Currently unused but kept for future API integration
	files,
	onStartOver,
}: ChatPageProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content: `Hi! I've processed and indexed your PDF "${files[0]?.name}" using vector embeddings. I can now answer questions about this document using semantic search. What would you like to know?`,
			timestamp: new Date(),
			status: 'sent',
		},
	]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({
			behavior: 'smooth',
		});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const searchDocuments = async (query: string) => {
		try {
			const response = await fetch(
				`/api/process-pdf?q=${encodeURIComponent(query)}`
			);
			if (!response.ok) {
				throw new Error('Failed to search documents');
			}
			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error('Error searching documents:', error);
			return [];
		}
	};

	const generateResponse = async (
		query: string,
		relevantChunks: any[]
	) => {
		// In a real implementation, you would use an LLM API here
		// For now, we'll create a response based on the relevant chunks
		if (relevantChunks.length === 0) {
			return "I couldn't find relevant information in your documents to answer that question. Please try rephrasing your question or ask about something else.";
		}

		const topChunk = relevantChunks[0];
		const similarity = (topChunk.similarity * 100).toFixed(
			1
		);

		return `Based on your documents, here's what I found (${similarity}% relevance):

**${topChunk.metadata.filename} - Chunk ${
			topChunk.metadata.chunkIndex + 1
		}**

${topChunk.content}

${
	relevantChunks.length > 1
		? `\n\nI also found ${
				relevantChunks.length - 1
		  } other relevant sections. Would you like me to elaborate on any specific aspect?`
		: ''
}`;
	};

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
			timestamp: new Date(),
			status: 'sending',
		};

		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput('');
		setIsTyping(true);

		setTimeout(() => {
			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === userMessage.id
						? { ...msg, status: 'sent' as const }
						: msg
				)
			);
		}, 500);

		try {
			// Search for relevant chunks
			const relevantChunks = await searchDocuments(
				currentInput
			);

			// Generate response based on relevant chunks
			const responseContent = await generateResponse(
				currentInput,
				relevantChunks
			);

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: responseContent,
				timestamp: new Date(),
				status: 'sent',
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error('Error generating response:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content:
					"I'm sorry, I encountered an error while processing your question. Please try again.",
				timestamp: new Date(),
				status: 'error',
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsTyping(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="h-full flex flex-col bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-5xl mx-auto p-6 space-y-6">
					{messages.map((message, index) => (
						<motion.div
							key={message.id}
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{
								duration: 0.4,
								delay: index * 0.05,
							}}
							className={`flex gap-4 ${
								message.role === 'user'
									? 'flex-row-reverse'
									: ''
							}`}>
							<motion.div
								whileHover={{ scale: 1.05 }}
								className={`
									shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg
									${
										message.role === 'user'
											? 'bg-gradient-to-br from-[#1f6feb] to-[#0969da] text-white'
											: 'bg-gradient-to-br from-[#21262d] to-[#30363d] text-[#e6edf3] border border-[#30363d]'
									}
								`}>
								{message.role === 'user' ? 'U' : 'AI'}
							</motion.div>

							<div
								className={`
									flex-1 max-w-4xl
									${message.role === 'user' ? 'flex justify-end' : ''}
								`}>
								<motion.div
									whileHover={{ scale: 1.02 }}
									className={`
										p-4 rounded-2xl relative group shadow-lg
										${
											message.role === 'user'
												? 'bg-gradient-to-br from-[#1f6feb] to-[#0969da] text-white'
												: 'bg-gradient-to-br from-[#21262d] to-[#161b22] border border-[#30363d] text-[#e6edf3]'
										}
									`}>
									<p className="whitespace-pre-wrap text-base leading-relaxed">
										{message.content}
									</p>

									<div className="flex items-center justify-between mt-2">
										<div className="flex items-center gap-2">
											{message.role === 'user' && (
												<div className="flex items-center gap-1">
													{message.status === 'sending' && (
														<motion.div
															animate={{ rotate: 360 }}
															transition={{
																duration: 1,
																repeat: Infinity,
																ease: 'linear',
															}}>
															<RefreshCw
																size={12}
																className="text-blue-200"
															/>
														</motion.div>
													)}
													{message.status === 'sent' && (
														<CheckCircle2
															size={12}
															className="text-blue-200"
														/>
													)}
													{message.status === 'error' && (
														<AlertCircle
															size={12}
															className="text-red-200"
														/>
													)}
												</div>
											)}
											<p
												className={`text-xs ${
													message.role === 'user'
														? 'text-blue-100'
														: 'text-[#7d8590]'
												}`}>
												{message.timestamp.toLocaleTimeString()}
											</p>
										</div>

										{message.role === 'assistant' && (
											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
												<button className="p-1 hover:bg-[#30363d] rounded text-[#7d8590] hover:text-[#e6edf3] transition-colors">
													<Copy size={12} />
												</button>
												<button className="p-1 hover:bg-[#30363d] rounded text-[#7d8590] hover:text-[#27ca3f] transition-colors">
													<ThumbsUp size={12} />
												</button>
												<button className="p-1 hover:bg-[#30363d] rounded text-[#7d8590] hover:text-[#ff5f56] transition-colors">
													<ThumbsDown size={12} />
												</button>
												<button className="p-1 hover:bg-[#30363d] rounded text-[#7d8590] hover:text-[#e6edf3] transition-colors">
													<MoreHorizontal size={12} />
												</button>
											</div>
										)}
									</div>
								</motion.div>
							</div>
						</motion.div>
					))}

					{isTyping && (
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -20, scale: 0.95 }}
							transition={{
								type: 'spring',
								stiffness: 100,
							}}
							className="flex gap-4">
							<div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#21262d] to-[#30363d] border border-[#30363d] flex items-center justify-center shadow-lg">
								<Bot size={18} className="text-[#e6edf3]" />
							</div>
							<div className="bg-[#161b22] border border-[#21262d] p-4 rounded-2xl shadow-lg">
								<div className="flex items-center gap-2">
									<span className="text-xs text-[#7d8590] mr-2">
										AI is typing
									</span>
									<div className="flex gap-1">
										<motion.div
											animate={{ y: [0, -6, 0] }}
											transition={{
												duration: 0.8,
												repeat: Infinity,
												delay: 0,
											}}
											className="w-2 h-2 bg-gradient-to-br from-[#1f6feb] to-[#a5d6ff] rounded-full"
										/>
										<motion.div
											animate={{ y: [0, -6, 0] }}
											transition={{
												duration: 0.8,
												repeat: Infinity,
												delay: 0.2,
											}}
											className="w-2 h-2 bg-gradient-to-br from-[#1f6feb] to-[#a5d6ff] rounded-full"
										/>
										<motion.div
											animate={{ y: [0, -6, 0] }}
											transition={{
												duration: 0.8,
												repeat: Infinity,
												delay: 0.4,
											}}
											className="w-2 h-2 bg-gradient-to-br from-[#1f6feb] to-[#a5d6ff] rounded-full"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</div>

			<div className="bg-gradient-to-r from-[#161b22] to-[#0d1117] border-t border-[#21262d] shadow-2xl">
				<div className="flex items-center justify-between p-6 border-b border-[#21262d] bg-gradient-to-r from-[#161b22] to-[#0d1117]">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-gradient-to-br from-[#1f6feb]/20 to-[#0969da]/20 rounded-xl">
							<MessageSquare
								size={20}
								className="text-[#1f6feb]"
							/>
						</div>
						<div>
							<span className="text-lg font-bold text-[#e6edf3]">
								Chat with AI
							</span>
							<p className="text-xs text-[#7d8590]">
								Ask questions about your documents
							</p>
						</div>
					</div>
					<motion.button
						onClick={onStartOver}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="bg-gradient-to-r from-[#21262d] to-[#30363d] hover:from-[#30363d] hover:to-[#21262d] text-[#e6edf3] flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-[#30363d] transition-all duration-300 shadow-lg">
						<RotateCcw size={16} />
						<span>Start Over</span>
					</motion.button>
				</div>

				<div className="p-6">
					<div className="flex gap-4 items-end">
						<div className="flex-1 bg-gradient-to-r from-[#0d1117] to-[#161b22] border border-[#30363d] rounded-2xl p-4 focus-within:border-[#1f6feb] focus-within:shadow-lg transition-all duration-300">
							<textarea
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask a question about your documents..."
								className="w-full bg-transparent border-none outline-none resize-none text-[#e6edf3] placeholder-[#7d8590] text-base leading-relaxed"
								rows={1}
								style={{
									minHeight: '24px',
									maxHeight: '120px',
								}}
							/>
						</div>

						<motion.button
							onClick={handleSend}
							disabled={!input.trim() || isTyping}
							whileHover={
								input.trim() && !isTyping
									? { scale: 1.05 }
									: {}
							}
							whileTap={
								input.trim() && !isTyping
									? { scale: 0.95 }
									: {}
							}
							className={`
								p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg
								${
									input.trim() && !isTyping
										? 'bg-gradient-to-r from-[#1f6feb] to-[#0969da] hover:from-[#0969da] hover:to-[#1f6feb] text-white cursor-pointer'
										: 'bg-gradient-to-r from-[#21262d] to-[#30363d] cursor-not-allowed text-[#7d8590]'
								}
							`}>
							<Send size={20} />
						</motion.button>
					</div>

					<div className="flex items-center justify-between mt-4">
						<div className="flex items-center gap-6 text-sm text-[#7d8590]">
							<span className="flex items-center gap-2">
								<div className="w-2 h-2 bg-[#1f6feb] rounded-full"></div>
								Press Enter to send, Shift+Enter for new
								line
							</span>
							<span className="flex items-center gap-2">
								<FileText
									size={14}
									className="text-[#1f6feb]"
								/>
								{files.length} document
								{files.length !== 1 ? 's' : ''} loaded
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-[#7d8590]">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: 'linear',
								}}>
								<Sparkles
									size={16}
									className="text-[#d2a8ff]"
								/>
							</motion.div>
							<span className="font-semibold">
								AI Assistant
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
