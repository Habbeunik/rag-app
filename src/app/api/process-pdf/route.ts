import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { embedMany, generateText } from "ai";
import { v4 as uuidv4 } from "uuid";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore, VectorDocument } from "@/lib/vector-store";
import { cleanText, extractMetadata } from "@/lib/text-utils";

async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values: texts,
  });

  return embeddings;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, filename } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json(
        { error: "No filename provided" },
        { status: 400 }
      );
    }

    const extractedText = cleanText(text);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "No text found in PDF" },
        { status: 400 }
      );
    }

    const metadata = extractMetadata(extractedText);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
    const chunks = await splitter.splitText(extractedText);
    console.log("chunks", chunks);
    console.log("metadata", metadata);

    const embeddings = await generateEmbeddings(chunks);

    console.log("embeddings", embeddings);

    const documentId = uuidv4();
    const documents: VectorDocument[] = chunks.map((chunk, index) => ({
      id: `${documentId}-${index}`,
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        filename,
        chunkIndex: index,
        totalChunks: chunks.length,
        pageNumber: Math.floor(index / 3) + 1, // Rough page estimation
      },
    }));

    console.log("documents", documents);

    // Clear previous documents and add new one (only one document at a time)
    vectorStore.clear();
    vectorStore.addDocuments(documents);

    return NextResponse.json({
      success: true,
      message: "PDF processed successfully. This is now your active document.",
      data: {
        filename,
        totalChunks: chunks.length,
        documentId,
        textLength: extractedText.length,
        metadata,
        chunks: chunks.map((chunk, index) => ({
          index,
          content: chunk.substring(0, 100) + "...", // Preview of chunk
          length: chunk.length,
        })),
      },
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve documents from vector store
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    const allDocs = vectorStore.getAllDocuments();
    return NextResponse.json({
      documents: allDocs.map((doc) => ({
        id: doc.id,
        content: doc.content.substring(0, 200) + "...",
        metadata: doc.metadata,
      })),
      total: allDocs.length,
    });
  }

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbeddings([query]);

    // Get optional document IDs filter (comma-separated)
    const documentIdsParam = searchParams.get("documentIds");
    const documentIds = documentIdsParam
      ? documentIdsParam.split(",").map((id) => id.trim())
      : undefined;

    // Search using vector store with optional document filter
    const results = vectorStore.searchBySimilarity(
      queryEmbedding[0],
      5, // Get top 5 most relevant chunks
      documentIds
    );

    console.log("results", results);

    if (results.length === 0) {
      return NextResponse.json({
        query,
        answer:
          "I couldn't wantlskd find any relevant information in the document to answer your question.",
        sources: [],
      });
    }

    //     // Build context from relevant chunks
    //     const context = results
    //       .map(
    //         (doc, idx) =>
    //           `[Source ${idx + 1} - ${doc.metadata.filename}, page ${
    //             doc.metadata.pageNumber
    //           }]:\n${doc.content}`
    //       )
    //       .join("\n\n");

    //     // Generate AI response using context
    //     const { text } = await generateText({
    //       model: openai("gpt-4o-mini"),
    //       messages: [
    //         {
    //           role: "system",
    //           content: `You are a helpful AI assistant that answers questions based on the provided document context.
    // Always base your answers on the context provided. If the context doesn't contain enough information to answer the question, say so.
    // Be concise and accurate. Cite sources when relevant by mentioning the page number.`,
    //         },
    //         {
    //           role: "user",
    //           content: `Context from the document:\n\n${context}\n\nQuestion: ${query}`,
    //         },
    //       ],
    //     });

    //     return NextResponse.json({
    //       query,
    //       answer: text,
    //       sources: results.map((doc) => ({
    //         content: doc.content.substring(0, 200) + "...",
    //         filename: doc.metadata.filename,
    //         pageNumber: doc.metadata.pageNumber,
    //         similarity: doc.similarity,
    //       })),
    //     });
  } catch (error) {
    console.error("Error generating answer:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 }
    );
  }
}
