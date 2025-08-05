import { openai } from "@ai-sdk/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { generateObject } from "ai";
import { unlink, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { tmpdir } from "os";
import { join } from "path";
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

    // Handle optional fields properly - allow null/undefined values
    if (!field.required) {
      zodType = zodType.nullable().optional();
    }

    schemaObject[field.name] = zodType;
  });

  return z.object(schemaObject);
}

// Function to extract text from various file types
async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    try {
      // Create a temporary file for PDF processing
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const tempPath = join(tmpdir(), `upload_${Date.now()}.pdf`);

      await writeFile(tempPath, buffer);

      // Use LangChain PDFLoader
      const loader = new PDFLoader(tempPath, {
        splitPages: false, // Get all content as single document
        parsedItemSeparator: " ", // Join text elements with space
      });

      const docs = await loader.load();

      // Clean up temporary file
      await unlink(tempPath);

      return docs[0]?.pageContent || "Could not extract text from PDF";
    } catch (error) {
      console.error("PDF extraction error:", error);
      return "Error extracting text from PDF. Please try uploading a text file instead.";
    }
  }

  // For text files and other formats, use text() method
  return await file.text();
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

    let extractedData;

    if (fieldsJson) {
      // Use predefined fields to build schema
      const parsedFields = JSON.parse(fieldsJson);
      // Post-process to ensure required field is always present
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
        schemaDescription:
          "Data extracted from the uploaded file based on user-defined fields",
        prompt: `Extract data from this document:

${fileContent}

Return structured data matching the provided schema. If information for any field is not found, use null for optional fields.`,
      });

      extractedData = object;
    } else {
      return NextResponse.json(
        { error: "Fields must be provided for structured extraction" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract data from file" },
      { status: 500 },
    );
  }
}
