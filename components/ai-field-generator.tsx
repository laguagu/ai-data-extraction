"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FieldType } from "@/hooks/use-extraction";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface GeneratedField {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "array";
  description: string;
  required: boolean;
  itemType?: "text" | "number";
}

interface GenerateFieldsResponse {
  success: boolean;
  fields: GeneratedField[];
  explanation: string;
}

interface AIFieldGeneratorProps {
  onFieldsGenerated: (fields: FieldType[]) => void;
}

export function AIFieldGenerator({ onFieldsGenerated }: AIFieldGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFields, setGeneratedFields] = useState<GeneratedField[]>([]);
  const [explanation, setExplanation] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please provide a description of what you want to extract");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });

      const data: GenerateFieldsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.success === false
            ? "Failed to generate fields"
            : "Unknown error",
        );
      }

      setGeneratedFields(data.fields);
      setExplanation(data.explanation);
      setShowPreview(true);
      toast.success("Fields generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate fields. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseFields = () => {
    const convertedFields: FieldType[] = generatedFields.map((field) => ({
      type: field.type,
      name: field.name,
      description: field.description,
      required: field.required,
      ...(field.itemType && { itemType: field.itemType }),
    }));

    onFieldsGenerated(convertedFields);
    setIsOpen(false);
    setShowPreview(false);
    setDescription("");
    setGeneratedFields([]);
    setExplanation("");
    toast.success(`Added ${convertedFields.length} AI-generated fields!`);
  };

  const handleStartOver = () => {
    setShowPreview(false);
    setGeneratedFields([]);
    setExplanation("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Generate Fields with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Field Generator
          </DialogTitle>
          <DialogDescription>
            Describe what information you want to extract, and AI will generate
            appropriate field definitions for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!showPreview ? (
            <>
              {/* Input Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-description">
                    What information do you want to extract?
                  </Label>
                  <Textarea
                    id="ai-description"
                    placeholder="Example: Extract person's contact details including name, email, phone, company, and job title from business cards..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={isGenerating}
                  />
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tip:</strong> Be specific about what you want to
                    extract. The AI will create appropriate field types and
                    descriptions based on your input.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!description.trim() || isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Fields
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Loading State */}
              {isGenerating && (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      AI is analyzing your request and generating field
                      definitions...
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Section */}
              {!isGenerating && generatedFields.length > 0 && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                      ✨ Generated {generatedFields.length} fields
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {explanation}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Generated Fields:</h4>
                    {generatedFields.map((field, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{field.name}</span>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {field.type}
                                {field.type === "array" &&
                                  field.itemType &&
                                  ` of ${field.itemType}s`}
                              </Badge>
                              {field.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {field.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      These fields will be added to your field list. You can
                      modify them after adding.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleStartOver}>
                      Start Over
                    </Button>
                    <Button
                      onClick={handleUseFields}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Use These Fields
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
