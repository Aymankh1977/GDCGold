import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractionResult {
  text: string;
  pages?: number;
  metadata?: Record<string, unknown>;
}

export const extractFromPDF = async (file: File): Promise<ExtractionResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const numPages = pdf.numPages;
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str?: string }) => item.str || '')
      .join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }
  
  const metadata = await pdf.getMetadata().catch(() => null);
  
  return {
    text: fullText.trim(),
    pages: numPages,
    metadata: metadata?.info as Record<string, unknown> | undefined,
  };
};

export const extractFromWord = async (file: File): Promise<ExtractionResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value,
    metadata: {
      messages: result.messages,
    },
  };
};

export const extractText = async (file: File): Promise<ExtractionResult> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return extractFromPDF(file);
    case 'docx':
    case 'doc':
      return extractFromWord(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
};