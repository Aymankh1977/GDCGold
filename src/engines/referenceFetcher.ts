// Helper: build Document objects from uploaded HTML/PDF content or from local HTML files.
// This helper normalises an uploaded HTML file. For PDFs, ensure you have an extractor
// that writes an extractedText field (or create .txt extracts alongside PDFs).

import { Document } from "@/types";
import * as cheerio from "cheerio";

/**
 * Convert an HTML string (from an uploaded file) into a Document with extractedText.
 * @param id
 * @param name
 * @param html
 * @param sourceUrl optional original URL to store in metadata.sourceUrl
 */
export function documentFromHtml(id: string, name: string, html: string, sourceUrl?: string): Document {
  const $ = cheerio.load(html);
  // Try to extract main text: select article/main content heuristics
  const candidate = $("main").text() || $("article").text() || $("body").text();
  const cleanText = collapseWhitespace(String(candidate));
  const doc: Document = {
    id,
    name,
    type: "html",
    extractedText: cleanText,
    metadata: {
      sourceUrl: sourceUrl || undefined
    }
  };
  return doc;
}

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, 