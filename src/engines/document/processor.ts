import { extractText } from './extractor';
import { generateId } from '@/utils/helpers';
import { Document, DocumentCategory } from '@/types';
import { useDocumentStore } from '@/store/documentStore';

/**
 * Coordinates the document processing workflow.
 * Handles extraction, metadata generation, and store integration.
 */
export const processUploadedFile = async (
  file: File,
  category: DocumentCategory = 'other'
): Promise<Document> => {
  const { addDocument } = useDocumentStore.getState();
  
  try {
    // 1. Extract raw text and metadata
    const extraction = await extractText(file);
    
    // 2. Construct the standardized Document object
    const newDocument: Document = {
      id: generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      category,
      extractedText: extraction.text,
      uploadedAt: new Date(),
      metadata: {
        ...extraction.metadata,
        pages: extraction.pages,
        lastModified: new Date(file.lastModified),
      },
    };
    
    // 3. Update the global store
    addDocument(newDocument);
    
    return newDocument;
  } catch (error) {
    console.error('Document Processing Error:', error);
    throw error;
  }
};

/**
 * Batch processing utility for multiple files.
 */
export const processMultipleFiles = async (
  files: FileList | File[],
  category: DocumentCategory = 'other'
): Promise<Document[]> => {
  const fileArray = Array.from(files);
  const results = await Promise.allSettled(
    fileArray.map(file => processUploadedFile(file, category))
  );
  
  const successfulDocs = results
    .filter((res): res is PromiseFulfilledResult<Document> => res.status === 'fulfilled')
    .map(res => res.value);
    
  const failures = results.filter(res => res.status === 'rejected');
  if (failures.length > 0) {
    console.warn(`${failures.length} files failed to process.`);
  }
  
  return successfulDocs;
};
