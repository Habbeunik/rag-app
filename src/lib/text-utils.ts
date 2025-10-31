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
