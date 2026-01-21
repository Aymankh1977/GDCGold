export class TextExtractionEngine {
  static async extractText(_file: File): Promise<string> {
    console.warn("PDF extraction is temporarily disabled (safe mode)");
    return "Mock extracted text for analysis pipeline.";
  }
}
