import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { embedMany, generateText } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import {
	vectorStore,
	VectorDocument,
} from '@/lib/vector-store';
import {
	cleanText,
	extractMetadata,
} from '@/lib/text-utils';

// Constants
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const TOP_K_RESULTS = 5;
const CHUNKS_PER_PAGE_ESTIMATE = 3;
const SYSTEM_PROMPT = `You are a helpful AI assistant that answers questions based on the provided document context.
Always base your answers on the context provided. If the context doesn't contain enough information to answer the question, say so.
Be concise and accurate. Cite sources when relevant by mentioning the page number.`;

// Types
interface ProcessPDFRequest {
	text: string;
	filename: string;
}

interface ProcessPDFResponse {
	success: boolean;
	message: string;
	data: {
		filename: string;
		totalChunks: number;
		documentId: string;
		textLength: number;
		metadata: ReturnType<typeof extractMetadata>;
		chunks: Array<{
			index: number;
			content: string;
			length: number;
		}>;
	};
}

interface SearchResponse {
	query: string;
	answer: string;
	sources: Array<{
		content: string;
		filename: string;
		pageNumber: number;
		similarity: number;
	}>;
}

interface ErrorResponse {
	error: string;
}

async function generateEmbeddings(
	texts: string[]
): Promise<number[][]> {
	const { embeddings } = await embedMany({
		model: openai.embedding('text-embedding-3-small'),
		values: texts,
	});
	return embeddings;
}

function validateProcessRequest(body: unknown): {
	isValid: boolean;
	error?: string;
} {
	if (!body || typeof body !== 'object') {
		return {
			isValid: false,
			error: 'Invalid request body',
		};
	}

	const { text, filename } =
		body as Partial<ProcessPDFRequest>;

	if (!text || typeof text !== 'string') {
		return { isValid: false, error: 'No text provided' };
	}

	if (!filename || typeof filename !== 'string') {
		return {
			isValid: false,
			error: 'No filename provided',
		};
	}

	return { isValid: true };
}

function createVectorDocuments(
	chunks: string[],
	embeddings: number[][],
	filename: string,
	documentId: string
): VectorDocument[] {
	return chunks.map((chunk, index) => ({
		id: `${documentId}-${index}`,
		content: chunk,
		embedding: embeddings[index],
		metadata: {
			filename,
			chunkIndex: index,
			totalChunks: chunks.length,
			pageNumber:
				Math.floor(index / CHUNKS_PER_PAGE_ESTIMATE) + 1,
		},
	}));
}

function formatContext(
	results: Array<VectorDocument & { similarity: number }>
): string {
	return results
		.map(
			(doc, idx) =>
				`[Source ${idx + 1} - ${
					doc.metadata.filename
				}, page ${doc.metadata.pageNumber}]:\n${
					doc.content
				}`
		)
		.join('\n\n');
}

function createErrorResponse(
	message: string,
	status: number = 500
): NextResponse<ErrorResponse> {
	return NextResponse.json({ error: message }, { status });
}

// POST endpoint - Process PDF
export async function POST(
	request: NextRequest
): Promise<
	NextResponse<ProcessPDFResponse | ErrorResponse>
> {
	try {
		const body = await request.json();
		const validation = validateProcessRequest(body);

		if (!validation.isValid) {
			return createErrorResponse(
				validation.error || 'Invalid request',
				400
			);
		}

		const { text, filename } = body as ProcessPDFRequest;
		const extractedText = cleanText(text);

		if (
			!extractedText ||
			extractedText.trim().length === 0
		) {
			return createErrorResponse(
				'No text found in PDF',
				400
			);
		}

		const metadata = extractMetadata(extractedText);
		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: CHUNK_SIZE,
			chunkOverlap: CHUNK_OVERLAP,
			separators: ['\n\n', '\n', '. ', ' ', ''],
		});

		const chunks = await splitter.splitText(extractedText);
		const embeddings = await generateEmbeddings(chunks);
		const documentId = uuidv4();
		const documents = createVectorDocuments(
			chunks,
			embeddings,
			filename,
			documentId
		);

		vectorStore.removeDocumentsByPrefix(documentId);
		vectorStore.addDocuments(documents);

		return NextResponse.json({
			success: true,
			message:
				'PDF processed successfully. This is now your active document.',
			data: {
				filename,
				totalChunks: chunks.length,
				documentId,
				textLength: extractedText.length,
				metadata,
				chunks: chunks.map((chunk, index) => ({
					index,
					content: chunk.substring(0, 100) + '...',
					length: chunk.length,
				})),
			},
		});
	} catch (error) {
		console.error('Error processing PDF:', error);
		return createErrorResponse(
			'Failed to process PDF',
			500
		);
	}
}

// GET endpoint - Search documents
export async function GET(
	request: NextRequest
): Promise<
	NextResponse<
		| SearchResponse
		| ErrorResponse
		| { documents: unknown[]; total: number }
	>
> {
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
		const queryEmbedding = await generateEmbeddings([
			query,
		]);
		const documentIdsParam =
			searchParams.get('documentIds');
		const documentIds = documentIdsParam
			? documentIdsParam.split(',').map((id) => id.trim())
			: undefined;

		const results = vectorStore.searchBySimilarity(
			queryEmbedding[0],
			TOP_K_RESULTS,
			documentIds
		);

		if (results.length === 0) {
			return NextResponse.json({
				query,
				answer:
					"I couldn't find any relevant information in the document to answer your question.",
				sources: [],
			});
		}

		const context = formatContext(results);
		const { text } = await generateText({
			model: openai('gpt-4o-mini'),
			messages: [
				{
					role: 'system',
					content: SYSTEM_PROMPT,
				},
				{
					role: 'user',
					content: `Context from the document:\n\n${context}\n\nQuestion: ${query}`,
				},
			],
		});

		return NextResponse.json({
			query,
			answer: text,
			sources: results.map((doc) => ({
				content: doc.content.substring(0, 200) + '...',
				filename: doc.metadata.filename,
				pageNumber: doc.metadata.pageNumber || 1,
				similarity: doc.similarity,
			})),
		});
	} catch (error) {
		console.error('Error generating answer:', error);
		return createErrorResponse(
			'Failed to generate answer',
			500
		);
	}
}
