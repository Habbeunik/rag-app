# PDF Vector Database API

This Next.js application provides a complete PDF processing pipeline that extracts text, chunks it, generates embeddings, and stores them in a vector database for semantic search.

## Features

- **PDF Text Extraction**: Extract text from PDF files using `pdf-parse`
- **Intelligent Text Chunking**: Split text into overlapping chunks with sentence boundary awareness
- **Embedding Generation**: Generate embeddings using OpenAI's `text-embedding-3-small` model
- **Vector Storage**: Store embeddings in an in-memory vector database with cosine similarity search
- **Semantic Search**: Search through documents using natural language queries
- **Modern UI**: Clean, responsive interface with drag-and-drop file upload

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already installed:

- `pdf-parse` - PDF text extraction
- `@ai-sdk/openai` - OpenAI integration for embeddings
- `ai` - AI SDK for embedding generation
- `uuid` - Unique ID generation
- `react-dropzone` - File upload with drag-and-drop

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# OpenAI API Key for embeddings
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Configure embedding model
# OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

**Important**: You need to get an OpenAI API key from [OpenAI's website](https://platform.openai.com/api-keys) and add it to your environment variables.

### 3. Usage

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Access the PDF processor**:
   Navigate to `http://localhost:3000/pdf-processor`

3. **Upload a PDF**:

   - Drag and drop a PDF file or click to select
   - The system will automatically:
     - Extract text from the PDF
     - Clean and chunk the text
     - Generate embeddings for each chunk
     - Store in the vector database

4. **Search documents**:
   - Use the search box to query your uploaded documents
   - Results are ranked by semantic similarity
   - Each result shows the similarity score and source information

## API Endpoints

### POST `/api/process-pdf`

Upload and process a PDF file.

**Request**: FormData with `file` field containing the PDF
**Response**: Processing results with chunk information

### GET `/api/process-pdf`

Search or retrieve documents.

**Query Parameters**:

- `q` (optional): Search query for semantic search
- Without `q`: Returns all stored documents

**Response**: Search results or document list

## Architecture

### Components

1. **API Route** (`/src/app/api/process-pdf/route.ts`):

   - Handles PDF upload and processing
   - Manages text extraction, chunking, and embedding generation
   - Provides search functionality

2. **Vector Store** (`/src/lib/vector-store.ts`):

   - In-memory vector database implementation
   - Cosine similarity search
   - Document management

3. **Text Utils** (`/src/lib/text-utils.ts`):

   - Text chunking with overlap
   - Text cleaning and metadata extraction
   - Sentence boundary detection

4. **PDF Processor UI** (`/src/components/PDFProcessor.tsx`):
   - Drag-and-drop file upload
   - Processing status display
   - Search interface and results

### Data Flow

1. **Upload**: PDF file uploaded via drag-and-drop
2. **Extraction**: Text extracted using `pdf-parse`
3. **Cleaning**: Text cleaned and normalized
4. **Chunking**: Text split into overlapping chunks
5. **Embedding**: Each chunk converted to vector embedding
6. **Storage**: Embeddings stored in vector database
7. **Search**: Query converted to embedding and matched against stored vectors

## Production Considerations

### Vector Database

The current implementation uses an in-memory vector store. For production, consider:

- **Pinecone**: Managed vector database service
- **Weaviate**: Open-source vector database
- **Chroma**: Lightweight vector database
- **Qdrant**: High-performance vector database

### Performance Optimizations

- Batch embedding generation
- Implement caching for frequently accessed documents
- Add pagination for large result sets
- Consider using streaming for large PDFs

### Security

- Add file size limits
- Implement rate limiting
- Add authentication/authorization
- Validate PDF content for malicious code

## Example Usage

```typescript
// Upload a PDF
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/process-pdf', {
	method: 'POST',
	body: formData,
});

const result = await response.json();
console.log('Processed chunks:', result.data.totalChunks);

// Search documents
const searchResponse = await fetch(
	'/api/process-pdf?q=machine learning'
);
const searchResults = await searchResponse.json();
console.log('Search results:', searchResults.results);
```

## Troubleshooting

### Common Issues

1. **"Failed to generate embedding" error**:

   - Check your OpenAI API key is valid
   - Ensure you have sufficient API credits
   - Verify the API key is in your `.env.local` file

2. **"No text found in PDF" error**:

   - The PDF might be image-based (scanned document)
   - Consider using OCR tools like Tesseract for image-based PDFs

3. **Memory issues with large PDFs**:
   - Implement streaming processing
   - Add file size limits
   - Consider chunking at the file level

### Development Tips

- Use the browser's developer tools to inspect API responses
- Check the console for detailed error messages
- Test with small PDFs first to verify the pipeline works
- Monitor API usage in your OpenAI dashboard
