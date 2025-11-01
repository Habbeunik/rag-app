/**
 * Extract text from a PDF file (browser-only)
 * This function dynamically imports pdfjs-dist to avoid server-side issues
 */
export async function extractPDFText(file: File): Promise<string> {
  // Only run in browser
  if (typeof window === "undefined") {
    throw new Error("extractPDFText can only be called in the browser");
  }

  // Dynamic import to avoid loading pdfjs-dist on the server
  const pdfjsLib = await import("pdfjs-dist");

  // Set up worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textPages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || "")
      .join(" ");
    textPages.push(pageText);
  }

  return textPages.join("\n");
}
