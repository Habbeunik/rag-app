'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

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
}

export default function ChatPage({
	documentId,
	files,
	onStartOver,
}: ChatPageProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content: `Ready to answer questions about ${files[0]?.name}`,
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({
			behavior: 'smooth',
		});
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const getAnswer = async (query: string) => {
		const url = new URL(
			'/api/process-pdf',
			window.location.origin
		);
		url.searchParams.set('q', query);
		if (documentId) {
			url.searchParams.set('documentIds', documentId);
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error('Failed to get answer');
		}
		const data = await response.json();
		return {
			answer:
				data.answer ||
				"I couldn't generate an answer. Please try again.",
			sources: data.sources || [],
		};
	};

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		const currentInput = input;
		setInput('');
		setIsLoading(true);

		try {
			const { answer } = await getAnswer(currentInput);

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: answer,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error('Error getting answer:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content:
					"I'm sorry, I encountered an error while processing your question. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (
		e: React.KeyboardEvent<HTMLTextAreaElement>
	) => {
		if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="h-screen flex flex-col bg-background">
			<div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h2 className="font-semibold truncate max-w-md">
							{files[0]?.name}
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Button
							variant="ghost"
							size="sm"
							onClick={onStartOver}>
							<RotateCcw size={16} className="mr-2" />
							New Document
						</Button>
					</div>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				<div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								'flex gap-4',
								message.role === 'user'
									? 'justify-end'
									: 'justify-start'
							)}>
							<div
								className={cn(
									'max-w-[85%] rounded-2xl px-5 py-3',
									message.role === 'user'
										? 'bg-foreground text-background'
										: 'bg-muted'
								)}>
								<p className="text-[15px] leading-relaxed whitespace-pre-wrap">
									{message.content}
								</p>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex gap-4 justify-start">
							<div className="max-w-[85%] rounded-2xl px-5 py-3 bg-muted">
								<div className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									<span className="text-[15px] text-muted-foreground">
										Thinking...
									</span>
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</div>

			<div className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<div className="max-w-3xl mx-auto px-6 py-4">
					<div className="flex gap-3">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyPress}
							placeholder="Ask a question..."
							className="min-h-[56px] max-h-[200px] resize-none rounded-xl"
							disabled={isLoading}
						/>
						<Button
							onClick={handleSend}
							disabled={!input.trim() || isLoading}
							size="icon"
							className="h-[56px] w-[56px] shrink-0 rounded-xl">
							<Send size={18} />
						</Button>
					</div>
					<p className="text-xs text-muted-foreground mt-3 text-center">
						Press Enter to send • Shift+Enter for new line
					</p>
				</div>
			</div>
		</div>
	);
}
