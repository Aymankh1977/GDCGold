import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class TextExtractionEngine {
  async extractFromPDF(filePath: string): Promise<{ text: string; pageCount: number }> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text,
        pageCount: data.numpages
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  async extractFromWord(filePath: string): Promise<{ text: string }> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return {
        text: result.value
      };
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error(`Failed to extract text from Word document: ${error}`);
    }
  }

  async extract(filePath: string): Promise<{ text: string; pageCount?: number }> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      return this.extractFromPDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
      return this.extractFromWord(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,;:!?'"()-]/g, '')
      .trim();
  }

  extractSections(text: string): Map<string, string> {
    const sections = new Map<string, string>();
    const sectionPatterns = [
      /(?:requirement|standard)\s*(\d+)/gi,
      /(?:section|part)\s*(\d+)/gi,
      /Q(\d+)\./gi
    ];

    // Split by common section indicators
    const lines = text.split('\n');
    let currentSection = 'general';
    let currentContent: string[] = [];

    for (const line of lines) {
      let sectionMatch = false;
      for (const pattern of sectionPatterns) {
        const match = line.match(pattern);
        if (match) {
          if (currentContent.length > 0) {
            sections.set(currentSection, currentContent.join('\n'));
          }
          currentSection = match[0].toLowerCase();
          currentContent = [];
          sectionMatch = true;
          break;
        }
      }
      if (!sectionMatch) {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections.set(currentSection, currentContent.join('\n'));
    }

    return sections;
  }
}