import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageFormatterProps {
	content: string;
	isUser: boolean;
}

export function MessageFormatter({
	content,
	isUser,
}: MessageFormatterProps) {
	// Preprocess content to style source citations
	const processedContent = content.replace(
		/\(Source \d+\)/g,
		(match) =>
			`<span class="source-citation">${match}</span>`
	);

	return (
		<div className="text-[15px] leading-relaxed">
			<ReactMarkdown
				components={{
					// Paragraphs
					p: ({ children }) => (
						<p className="mb-3 last:mb-0">{children}</p>
					),

					// Bold text
					strong: ({ children }) => (
						<strong className="font-bold text-slate-900 dark:text-white">
							{children}
						</strong>
					),

					// Ordered lists
					ol: ({ children }) => (
						<ol className="my-3 ml-5 space-y-2 list-decimal marker:font-semibold marker:text-slate-600 dark:marker:text-slate-400">
							{children}
						</ol>
					),

					// Unordered lists
					ul: ({ children }) => (
						<ul className="my-3 ml-5 space-y-2 list-disc marker:text-slate-600 dark:marker:text-slate-400">
							{children}
						</ul>
					),

					// List items
					li: ({ children }) => (
						<li className="pl-2">{children}</li>
					),

					// Links
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={`underline hover:no-underline ${
								isUser
									? 'text-white hover:text-white/90'
									: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
							}`}>
							{children}
						</a>
					),

					// Code blocks
					code: ({ children, ...props }) => {
						const inline = !props.className;
						return inline ? (
							<code
								className={`px-1.5 py-0.5 rounded text-sm font-mono ${
									isUser
										? 'bg-white/20 text-white'
										: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
								}`}>
								{children}
							</code>
						) : (
							<pre
								className={`my-3 p-4 rounded-lg overflow-x-auto ${
									isUser
										? 'bg-white/10 text-white'
										: 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
								}`}>
								<code className="text-sm font-mono">
									{children}
								</code>
							</pre>
						);
					},

					// Headings
					h1: ({ children }) => (
						<h1 className="text-xl font-bold mt-4 mb-2">
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-lg font-bold mt-3 mb-2">
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-base font-bold mt-3 mb-2">
							{children}
						</h3>
					),

					// Blockquotes
					blockquote: ({ children }) => (
						<blockquote
							className={`my-3 pl-4 border-l-4 italic ${
								isUser
									? 'border-white/40 text-white/90'
									: 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
							}`}>
							{children}
						</blockquote>
					),
				}}>
				{processedContent}
			</ReactMarkdown>
		</div>
	);
}
