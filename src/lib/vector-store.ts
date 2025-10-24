// Vector store utilities and types
export interface VectorDocument {
	id: string;
	content: string;
	embedding: number[];
	metadata: {
		filename: string;
		chunkIndex: number;
		totalChunks: number;
		pageNumber?: number;
	};
}

// Simple in-memory vector store (replace with proper vector DB in production)
export class VectorStore {
	private documents: VectorDocument[] = [];

	addDocuments(docs: VectorDocument[]): void {
		this.documents.push(...docs);
	}

	getAllDocuments(): VectorDocument[] {
		return this.documents;
	}

	searchBySimilarity(
		queryEmbedding: number[],
		topK: number = 10
	): Array<VectorDocument & { similarity: number }> {
		const results = this.documents.map((doc) => ({
			...doc,
			similarity: this.cosineSimilarity(
				queryEmbedding,
				doc.embedding
			),
		}));

		return results
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, topK);
	}

	private cosineSimilarity(
		a: number[],
		b: number[]
	): number {
		if (a.length !== b.length) {
			throw new Error('Vectors must have the same length');
		}

		let dotProduct = 0;
		let normA = 0;
		let normB = 0;

		for (let i = 0; i < a.length; i++) {
			dotProduct += a[i] * b[i];
			normA += a[i] * a[i];
			normB += b[i] * b[i];
		}

		return (
			dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
		);
	}

	getDocumentCount(): number {
		return this.documents.length;
	}

	clear(): void {
		this.documents = [];
	}
}

// Global vector store instance
export const vectorStore = new VectorStore();
