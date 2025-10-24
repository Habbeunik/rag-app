// Text processing utilities

export function chunkText(
	text: string,
	chunkSize: number = 1000,
	overlap: number = 200
): string[] {
	const chunks: string[] = [];
	let start = 0;

	while (start < text.length) {
		const end = Math.min(start + chunkSize, text.length);
		let chunk = text.slice(start, end);

		// Try to break at sentence boundaries
		if (end < text.length) {
			const lastSentenceEnd = chunk.lastIndexOf('.');
			const lastNewline = chunk.lastIndexOf('\n');
			const breakPoint = Math.max(
				lastSentenceEnd,
				lastNewline
			);

			if (breakPoint > start + chunkSize * 0.5) {
				chunk = chunk.slice(0, breakPoint + 1);
			}
		}

		chunks.push(chunk.trim());
		start = start + chunk.length - overlap;
	}

	return chunks.filter((chunk) => chunk.length > 0);
}

export function cleanText(text: string): string {
	return text
		.replace(/\s+/g, ' ') // Replace multiple whitespace with single space
		.replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
		.trim();
}

export function extractMetadata(text: string): {
	wordCount: number;
	sentenceCount: number;
	paragraphCount: number;
} {
	const words = text
		.split(/\s+/)
		.filter((word) => word.length > 0);
	const sentences = text
		.split(/[.!?]+/)
		.filter((sentence) => sentence.trim().length > 0);
	const paragraphs = text
		.split(/\n\s*\n/)
		.filter((paragraph) => paragraph.trim().length > 0);

	return {
		wordCount: words.length,
		sentenceCount: sentences.length,
		paragraphCount: paragraphs.length,
	};
}
