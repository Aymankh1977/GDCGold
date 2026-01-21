import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker (Vite-compatible)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractionResult {
  text: string;
  pages?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Extract text from PDF with stable, esbuild-safe syntax.
 */
export const extractFromPDF = async (file: File): Promise<ExtractionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = (textContent.items as any[])
        .map(item => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // ✅ IMPORTANT: normal template literal — NO escaping
      fullText += `\n[PAGE ${i}]\n${pageText}`;
    }

    const metadata = await pdf.getMetadata().catch(() => null);

    return {
      text: fullText.trim(),
      pages: numPages,
      metadata: metadata?.info as Record<string, unknown> | undefined,
    };
  } catch (error) {
    console.error('PDF Extraction Error:', error);
    throw new Error(
      'Failed to extract text from PDF. The file may be corrupted or protected.'
    );
  }
};

/**
 * Extract text from Word documents using Mammoth.
 */
export const extractFromWord = async (file: File): Promise<ExtractionResult> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    const cleanedText = result.value
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return {
      text: cleanedText,
      metadata: {
        messages: result.messages,
      },
    };
  } catch (error) {
    console.error('Word Extraction Error:', error);
    throw new Error('Failed to extract text from Word document.');
  }
};

/**
 * Unified entry point for text extraction.
 */
export const extractText = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return extractFromPDF(file);
    case 'docx':
    case 'doc':
      return extractFromWord(file);
    default:
      throw new Error(
        `Unsupported file type: .${extension}. Please upload a PDF or Word document.`
      );
  }
};
