import { getPdfContentFromFile } from "@/lib/langchain-pdf-parser";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Define common field types for dynamic schema building
const FieldTypeSchema = z.union([
  z.object({
    type: z.literal("text"),
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean(),
  }),
  z.object({
    type: z.literal("number"),
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean(),
  }),
  z.object({
    type: z.literal("boolean"),
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean(),
  }),
  z.object({
    type: z.literal("date"),
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean(),
  }),
  z.object({
    type: z.literal("array"),
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean(),
    itemType: z.enum(["text", "number"]),
  }),
]);

type FieldType = z.infer<typeof FieldTypeSchema>;

// Function to build Zod schema from field definitions
function buildZodSchema(fields: FieldType[]) {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let zodType: z.ZodTypeAny;

    switch (field.type) {
      case "text":
        zodType = z.string();
        if (field.description) {
          zodType = zodType.describe(field.description);
        }
        break;
      case "number":
        zodType = z.number();
        if (field.description) {
          zodType = zodType.describe(field.description);
        }
        break;
      case "boolean":
        zodType = z.boolean();
        if (field.description) {
          zodType = zodType.describe(field.description);
        }
        break;
      case "date":
        zodType = z
          .string()
          .describe(field.description || "Date in ISO format");
        break;
      case "array":
        const itemSchema =
          field.itemType === "number" ? z.number() : z.string();
        zodType = z.array(itemSchema);
        if (field.description) {
          zodType = zodType.describe(field.description);
        }
        break;
      default:
        zodType = z.string();
    }

    // Make optional fields actually optional with default values
    if (!field.required) {
      switch (field.type) {
        case "text":
        case "date":
          zodType = zodType.optional().default("");
          break;
        case "number":
          zodType = zodType.optional().default(0);
          break;
        case "boolean":
          zodType = zodType.optional().default(false);
          break;
        case "array":
          zodType = zodType.optional().default([]);
          break;
        default:
          zodType = zodType.optional().default("");
      }
    }

    schemaObject[field.name] = zodType;
  });

  return z.object(schemaObject);
}

// Extract text from various file types
async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return getPdfContentFromFile(file);
  }

  // For text files, use text() method
  try {
    const text = await file.text();
    if (!text.trim()) {
      throw new Error("File is empty");
    }
    return text;
  } catch (error) {
    throw new Error("Failed to read file");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fieldsJson = formData.get("fields") as string;
    const description = formData.get("description") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extract text content from file
    const fileContent = await extractTextFromFile(file);

    if (!fieldsJson) {
      return NextResponse.json(
        { error: "Fields must be provided" },
        { status: 400 },
      );
    }

    // Parse and validate fields
    const parsedFields = JSON.parse(fieldsJson);
    const processedFields = parsedFields.map(
      (field: Record<string, unknown>) => ({
        ...field,
        required: field.required ?? false,
      }),
    );

    const fields = z.array(FieldTypeSchema).parse(processedFields);
    const schema = buildZodSchema(fields);

    const { object } = await generateObject({
      model: openai("gpt-4.1"),
      schema: schema,
      schemaName: "ExtractedData",
      prompt: `Extract the requested information from this document:

${fileContent}

${description ? `Context: ${description}` : ""}`,
    });

    return NextResponse.json({
      success: true,
      data: object,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Extraction error:", error);

    if (error instanceof Error) {
      // Provide more specific error messages based on the error type
      let userMessage = error.message;

      if (error.message.includes("corrupted, encrypted, or encoded")) {
        userMessage =
          "This PDF appears to contain corrupted, encrypted, or encoded text. " +
          "Please try: 1) Re-saving the PDF from the original document, " +
          "2) Converting it to a standard PDF format, or " +
          "3) Using a different PDF file with readable text content.";
      } else if (error.message.includes("image-based PDF")) {
        userMessage =
          "This PDF appears to be image-based (scanned document). " +
          "To extract text from scanned documents, you'll need to use OCR " +
          "(Optical Character Recognition) tools first.";
      } else if (error.message.includes("Invalid PDF")) {
        userMessage =
          "The uploaded file is not a valid PDF document. " +
          "Please ensure you're uploading a proper PDF file.";
      }

      return NextResponse.json(
        {
          error: userMessage,
          details:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to extract data from the document" },
      { status: 500 },
    );
  }
}
