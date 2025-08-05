import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for field generation response - simplified to avoid transform issues
const FieldGenerationSchema = z.object({
  fields: z.array(
    z.object({
      name: z.string().describe("Field name in camelCase"),
      type: z
        .enum(["text", "number", "boolean", "date", "array"])
        .describe("Field data type"),
      description: z
        .string()
        .describe("Description of what this field should contain"),
      required: z
        .boolean()
        .optional()
        .describe("Whether this field is required (true or false)"),
      itemType: z
        .enum(["text", "number"])
        .optional()
        .describe("For array fields, the type of items in the array"),
    }),
  ),
  explanation: z.string().describe("Brief explanation of the generated fields"),
});

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    const result = await generateObject({
      model: openai("gpt-4.1"),
      schema: FieldGenerationSchema,
      schemaName: "GeneratedFields",
      schemaDescription:
        "AI-generated field definitions based on user description",
      prompt: `Generate appropriate field definitions for: "${description}"
        
        Rules:
        1. Use camelCase field names (e.g., firstName, phoneNumber)
        2. Choose appropriate data types: text, number, boolean, date, array
        3. For each field, set required: true for essential fields, required: false for optional ones
        4. Generate 3-8 relevant fields with clear descriptions
        5. For arrays, specify itemType (text or number)`,
    });

    // Post-process to ensure required field is always present
    const processedFields = result.object.fields.map((field) => ({
      ...field,
      required: field.required ?? false,
    }));

    return NextResponse.json({
      success: true,
      fields: processedFields,
      explanation: result.object.explanation,
    });
  } catch (error) {
    console.error("Field generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate fields" },
      { status: 500 },
    );
  }
}
