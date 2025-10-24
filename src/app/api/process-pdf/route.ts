import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { openai } from '@ai-sdk/openai';
import { generateEmbedding } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import {
	vectorStore,
	VectorDocument,
} from '@/lib/vector-store';
import {
	chunkText,
	cleanText,
	extractMetadata,
} from '@/lib/text-utils';

// Generate embeddings using OpenAI
async function generateEmbeddings(
	texts: string[]
): Promise<number[][]> {
	const embeddings: number[][] = [];

	for (const text of texts) {
		try {
			const { embedding } = await generateEmbedding({
				model: openai.embedding('text-embedding-3-small'),
				value: text,
			});
			embeddings.push(embedding);
		} catch (error) {
			console.error('Error generating embedding:', error);
			throw new Error('Failed to generate embedding');
		}
	}

	return embeddings;
}

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json(
				{ error: 'No file provided' },
				{ status: 400 }
			);
		}

		if (file.type !== 'application/pdf') {
			return NextResponse.json(
				{ error: 'File must be a PDF' },
				{ status: 400 }
			);
		}

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Extract text from PDF
		const pdfData = await pdf(buffer);
		const extractedText = cleanText(pdfData.text);

		if (
			!extractedText ||
			extractedText.trim().length === 0
		) {
			return NextResponse.json(
				{ error: 'No text found in PDF' },
				{ status: 400 }
			);
		}

		// Extract metadata
		const metadata = extractMetadata(extractedText);

		// Split text into chunks
		const chunks = chunkText(extractedText, 1000, 200);

		// Generate embeddings for each chunk
		const embeddings = await generateEmbeddings(chunks);

		// Store in vector database
		const documentId = uuidv4();
		const documents: VectorDocument[] = chunks.map(
			(chunk, index) => ({
				id: `${documentId}-${index}`,
				content: chunk,
				embedding: embeddings[index],
				metadata: {
					filename: file.name,
					chunkIndex: index,
					totalChunks: chunks.length,
					pageNumber: Math.floor(index / 3) + 1, // Rough page estimation
				},
			})
		);

		// Add to vector store
		vectorStore.addDocuments(documents);

		return NextResponse.json({
			success: true,
			message: 'PDF processed successfully',
			data: {
				filename: file.name,
				totalChunks: chunks.length,
				documentId,
				textLength: extractedText.length,
				metadata,
				chunks: chunks.map((chunk, index) => ({
					index,
					content: chunk.substring(0, 100) + '...', // Preview of chunk
					length: chunk.length,
				})),
			},
		});
	} catch (error) {
		console.error('Error processing PDF:', error);
		return NextResponse.json(
			{ error: 'Failed to process PDF' },
			{ status: 500 }
		);
	}
}

// GET endpoint to retrieve documents from vector store
export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get('q');

	if (!query) {
		const allDocs = vectorStore.getAllDocuments();
		return NextResponse.json({
			documents: allDocs.map((doc) => ({
				id: doc.id,
				content: doc.content.substring(0, 200) + '...',
				metadata: doc.metadata,
			})),
			total: allDocs.length,
		});
	}

	try {
		// Generate embedding for search query
		const queryEmbedding = await generateEmbeddings([
			query,
		]);

		// Search using vector store
		const results = vectorStore.searchBySimilarity(
			queryEmbedding[0],
			10
		);

		return NextResponse.json({
			query,
			results: results.map((doc) => ({
				id: doc.id,
				content: doc.content,
				metadata: doc.metadata,
				similarity: doc.similarity,
			})),
			total: results.length,
		});
	} catch (error) {
		console.error('Error searching documents:', error);
		return NextResponse.json(
			{ error: 'Failed to search documents' },
			{ status: 500 }
		);
	}
}
