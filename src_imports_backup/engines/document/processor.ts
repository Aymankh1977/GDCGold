import { Document, DocumentCategory, DocumentMetadata } from '@/types';
import { extractText, ExtractionResult } from './extractor';
import { parseDocument, ParsedDocument } from './parser';
import { generateId } from '@/utils/helpers';

export interface ProcessedDocument {
  document: Omit<Document, 'uploadedAt'>;
  parsed: ParsedDocument;
}

export const processFile = async (
  file: File,
  category: DocumentCategory = 'other'
): Promise<ProcessedDocument> => {
  // Extract text from file
  const extraction = await extractText(file);
  
  // Parse the extracted text
  const parsed = parseDocument(extraction.text);
  
  // Determine category if not specified
  const detectedCategory = category === 'other' 
    ? detectCategory(extraction.text, file.name) 
    : category;
  
  // Build document object
  const document: Omit<Document, 'uploadedAt'> = {
    id: generateId(),
    name: file.name,
    type: getFileType(file.name),
    size: file.size,
    content: extraction.text,
    extractedText: extraction.text,
    metadata: buildMetadata(extraction, file),
    status: 'completed',
    category: detectedCategory,
  };
  
  return { document, parsed };
};

const getFileType = (filename: string): 'pdf' | 'docx' | 'doc' => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  return 'doc';
};

const detectCategory = (text: string, filename: string): DocumentCategory => {
  const lowerText = text.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  if (
    lowerFilename.includes('questionnaire') ||
    lowerText.includes('pre-inspection questionnaire') ||
    lowerText.includes('q1.') && lowerText.includes('provider name')
  ) {
    return 'pre-inspection-questionnaire';
  }
  
  if (
    lowerFilename.includes('inspection') ||
    lowerFilename.includes('report') ||
    lowerText.includes('inspection report') ||
    lowerText.includes('sufficiency')
  ) {
    return 'inspection-report';
  }
  
  if (
    lowerFilename.includes('policy') ||
    lowerFilename.includes('procedure')
  ) {
    return 'policy';
  }
  
  if (
    lowerFilename.includes('evidence') ||
    lowerFilename.includes('appendix')
  ) {
    return 'evidence';
  }
  
  return 'other';
};

const buildMetadata = (
  extraction: ExtractionResult,
  file: File
): DocumentMetadata => {
  return {
    pages: extraction.pages,
    author: extraction.metadata?.Author as string | undefined,
    createdDate: extraction.metadata?.CreationDate 
      ? new Date(extraction.metadata.CreationDate as string) 
      : undefined,
    modifiedDate: new Date(file.lastModified),
    keywords: extraction.metadata?.Keywords 
      ? (extraction.metadata.Keywords as string).split(',').map(k => k.trim())
      : undefined,
  };
};

export const processMultipleFiles = async (
  files: File[],
  category?: DocumentCategory
): Promise<ProcessedDocument[]> => {
  const results: ProcessedDocument[] = [];
  
  for (const file of files) {
    try {
      const processed = await processFile(file, category);
      results.push(processed);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }
  
  return results;
};