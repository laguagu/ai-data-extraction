"use client";

import { DocumentUploader } from "@/components/document-uploader";
import { FieldBuilder } from "@/components/field-builder";
import { ResultsDisplay } from "@/components/results-display";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/ui/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { FieldType, useExtraction } from "@/hooks/use-extraction";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function HomePage() {
  const { extractData, isLoading, result, error, reset } = useExtraction();

  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FieldType[]>([]);
  const [description, setDescription] = useState("");
  const [showAdditionalContext, setShowAdditionalContext] = useState(false);

  const handleExtract = async () => {
    if (!file) return;

    // Determine extraction mode based on what user has provided
    if (fields.length > 0) {
      await extractData(
        file,
        "fields",
        fields,
        description.trim() || undefined,
      );
    } else if (description.trim()) {
      await extractData(file, "description", undefined, description);
    }
  };

  const resetAll = () => {
    reset();
    setFile(null);
    setFields([]);
    setDescription("");
    setShowAdditionalContext(false);
  };

  // Show loading state during processing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mesh dark:bg-gradient-mesh-dark">
        <div className="container mx-auto px-4 py-8">
          <LoadingState
            message="Extracting data from your document..."
            showProgress={true}
          />
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  // Show results if we have them
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-mesh dark:bg-gradient-mesh-dark">
        <div className="container mx-auto px-4 py-8">
          <ResultsDisplay result={result} onReset={resetAll} />
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh dark:bg-gradient-mesh-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient font-inter">
              DocuMind AI
            </h1>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-inter">
            Extract structured data from your documents using AI. Define custom
            fields and describe what you need, and our intelligent agent will
            extract the information for you.
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Document
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload a PDF document to extract structured data from it
              </p>
            </CardHeader>
            <CardContent>
              <DocumentUploader file={file} onFileChange={setFile} />
            </CardContent>
          </Card>

          {/* Main extraction configuration - side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Field Definition */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Define Fields to Extract
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Define specific fields you want to extract from your document.
                  Use templates for quick start, AI generation, or create custom
                  fields manually.
                </p>
              </CardHeader>
              <CardContent>
                <FieldBuilder fields={fields} onFieldsChange={setFields} />
              </CardContent>
            </Card>

            {/* Right Column: Additional Context and Status */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Extraction Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure additional settings for better extraction results.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Additional Context Toggle */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setShowAdditionalContext(!showAdditionalContext)
                    }
                    className="w-full justify-between h-auto p-3 border-dashed hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Additional Context</span>
                      <span className="text-xs text-muted-foreground">
                        (Optional)
                      </span>
                    </div>
                    {showAdditionalContext ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {showAdditionalContext && (
                    <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/20">
                      <div className="space-y-2">
                        <Label
                          htmlFor="description"
                          className="text-sm font-medium"
                        >
                          What additional context would you like to provide?
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="Provide additional context like 'Pay attention to tables and lists', 'Focus on contact information', 'Extract dates in MM/DD/YYYY format', etc."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      {description.trim() && (
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-sm text-primary">
                            💡 Your additional context will enhance the
                            extraction process.
                          </p>
                        </div>
                      )}

                      {/* Extraction Tips */}
                      <div className="p-3 bg-muted/50 border border-border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">
                          💡 Pro Tips:
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          <li>
                            • Field definitions are sufficient for most
                            extractions
                          </li>
                          <li>
                            • Add context for specific formatting requirements
                          </li>
                          <li>
                            • Mention if data might be in tables, lists, or
                            specific sections
                          </li>
                          <li>
                            • Describe edge cases or alternative phrasings that
                            might appear
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Section and Extract Button moved here for bento-grid style */}
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                            fields.length > 0
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Settings className="h-4 w-4" />
                          {fields.length} Fields Defined
                        </div>
                        {(showAdditionalContext || description.trim()) && (
                          <>
                            <div className="text-lg text-muted-foreground">
                              +
                            </div>
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                description.trim()
                                  ? "bg-secondary/60 text-secondary-foreground border border-secondary/20"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <MessageSquare className="h-4 w-4" />
                              Context {description.trim() ? "Added" : "Ready"}
                            </div>
                          </>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground text-center">
                        {fields.length > 0 && description.trim()
                          ? "Perfect! Field definitions with additional context for optimal extraction."
                          : fields.length > 0
                            ? "Ready to extract! All fields are defined for extraction."
                            : "Define fields to specify what data you want to extract from your document."}
                      </p>
                    </div>
                  </div>

                  {/* Extract Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleExtract}
                      disabled={!file || isLoading || fields.length === 0}
                      size="lg"
                      className="px-12 py-6 text-lg w-full max-w-md"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                          Extracting Data...
                        </>
                      ) : (
                        <>
                          <Brain className="h-5 w-5 mr-3" />
                          Extract Data with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Error Display */}
          {error && (
            <ErrorDisplay
              error={error}
              onReset={resetAll}
              onRetry={() => handleExtract()}
            />
          )}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
