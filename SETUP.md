# PDF RAG Demo Setup

## Quick Start

1. **Set up your OpenAI API key**:

   ```bash
   # Create .env.local file in the project root
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to `http://localhost:3000`

## How It Works

### Upload Flow

1. **Upload PDFs**: Drag and drop PDF files on the upload page
2. **Processing**: The app automatically:
   - Extracts text from PDFs
   - Chunks the text into overlapping segments
   - Generates embeddings using OpenAI's `text-embedding-3-small`
   - Stores embeddings in a vector database
3. **Chat**: Once processed, you can ask questions about your documents

### RAG (Retrieval-Augmented Generation)

- Your questions are converted to embeddings
- The system finds the most relevant text chunks using cosine similarity
- Responses are generated based on the retrieved context
- Each response shows the relevance score and source information

## Features

✅ **PDF Text Extraction** - Extracts text from PDF files  
✅ **Intelligent Chunking** - Splits text with sentence boundary awareness  
✅ **Vector Embeddings** - Uses OpenAI embeddings for semantic search  
✅ **Real-time Processing** - Shows progress during PDF processing  
✅ **Semantic Search** - Find relevant content using natural language  
✅ **Modern UI** - Beautiful, responsive interface with animations

## API Endpoints

- `POST /api/process-pdf` - Upload and process PDF files
- `GET /api/process-pdf?q=query` - Search documents using semantic similarity

## Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and add it to your `.env.local` file

## Troubleshooting

**"Failed to generate embedding" error**:

- Check your OpenAI API key is valid
- Ensure you have sufficient API credits
- Verify the API key is in your `.env.local` file

**"No text found in PDF" error**:

- The PDF might be image-based (scanned document)
- Try with a text-based PDF first

**Memory issues**:

- The current implementation uses in-memory storage
- For production, consider using a proper vector database like Pinecone or Weaviate
