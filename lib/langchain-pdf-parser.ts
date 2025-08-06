import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import os from "os";
import path from "path";

// Create a temporary file for LangChain PDFLoader since it needs file path
async function createTempFile(file: File): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${file.name}`);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate that this is actually a PDF file
  if (!isValidPDF(buffer)) {
    throw new Error(
      "Invalid PDF file format. Please upload a valid PDF document.",
    );
  }

  await fs.writeFile(tempFilePath, buffer);
  return tempFilePath;
}

// Clean up temporary file
async function deleteTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Silently ignore cleanup errors
  }
}

/**
 * Validate if a buffer contains a valid PDF file
 */
function isValidPDF(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 5) {
    return false;
  }

  // PDF files start with "%PDF-"
  const header = buffer.subarray(0, 5).toString("ascii");
  return header === "%PDF-";
}

export async function getPdfContentFromFile(file: File): Promise<string> {
  let tempFilePath: string | null = null;

  try {
    if (!file || file.size === 0) {
      throw new Error("No file provided or file is empty");
    }

    if (file.type !== "application/pdf") {
      throw new Error("File must be a PDF document");
    }

    // Create temporary file for LangChain
    tempFilePath = await createTempFile(file);

    // Create PDFLoader with error handling
    const loader = new PDFLoader(tempFilePath, {
      splitPages: false, // Get all content as one document
      parsedItemSeparator: " ", // Use space between text elements
    });

    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      throw new Error(
        "No content found in PDF. This appears to be an image-based (scanned) PDF that requires OCR to extract text.",
      );
    }

    // Combine all pages and check for content
    let allText = docs
      .map((doc: any) => {
        return doc.pageContent || "";
      })
      .join("\n");

    // Enhanced text cleaning to handle special characters and encoding issues
    allText = allText
      // Remove control characters and unwanted symbols
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Remove problematic Unicode characters (arrows, symbols, etc.)
      .replace(/[☻♥♦♣☺♠►♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼]/g, "")
      // Remove excessive punctuation and symbols that might indicate encoding issues
      .replace(/[¡¢£¤¥¦§¨©ª«¬]/g, "")
      // Normalize whitespace
      .replace(/\s+/g, " ")
      // Normalize line breaks
      .replace(/\n+/g, "\n")
      .trim();

    // Check for corrupted or encoded content
    const readableText = allText.replace(/[^\w\s\.,!?;:()\-]/g, "");
    const totalChars = allText.length;
    const readableChars = readableText.length;
    const readableRatio = totalChars > 0 ? readableChars / totalChars : 0;

    // If less than 30% of characters are readable, it's likely corrupted
    if (readableRatio < 0.3) {
      throw new Error(
        "PDF appears to contain corrupted, encrypted, or encoded text that cannot be read. " +
          "The document may be damaged, password-protected, or in an unsupported format. " +
          "Please try with a different PDF file or convert it to a standard text-based PDF format.",
      );
    }

    // Check for excessive repeated characters (sign of encoding issues)
    const repeatedPattern = /(.)\1{10,}/g;
    if (repeatedPattern.test(allText)) {
      console.warn(
        "PDF contains excessive repeated characters, may have encoding issues",
      );
    }

    if (allText.length < 10) {
      throw new Error(
        "PDF contains very little readable text. This appears to be an image-based PDF. " +
          "Consider using OCR tools (e.g., Tesseract.js) to extract text from image-based PDFs.",
      );
    }

    // Check for common indicators of image-based PDFs
    const wordCount = allText
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;
    if (wordCount < 5) {
      throw new Error(
        "PDF contains minimal text content. This likely indicates an image-based PDF that requires OCR.",
      );
    }

    return allText;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw known errors with better context
      if (
        error.message.includes("Invalid PDF") ||
        error.message.includes("image-based") ||
        error.message.includes("OCR")
      ) {
        throw error;
      }

      // Handle LangChain specific errors
      if (error.message.includes("Cannot read properties")) {
        throw new Error("PDF file appears to be corrupted or invalid");
      }

      if (error.message.includes("pdf-parse")) {
        throw new Error(
          "Failed to parse PDF content. The file might be corrupted or password-protected.",
        );
      }

      // Generic error with context
      throw new Error(`PDF parsing failed: ${error.message}`);
    }

    throw new Error("Failed to parse PDF content");
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      await deleteTempFile(tempFilePath);
    }
  }
}

export async function getPdfContentFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
    }

    // Convert response to File-like object
    const blob = await response.blob();
    const file = new File([blob], "downloaded.pdf", {
      type: "application/pdf",
    });

    return getPdfContentFromFile(file);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load PDF from URL: ${error.message}`);
    }
    throw new Error("Failed to load PDF from URL");
  }
}
