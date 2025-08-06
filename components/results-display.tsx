"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtractionResult } from "@/hooks/use-extraction";
import {
  Calendar,
  CheckCircle,
  Copy,
  Database,
  Download,
  Eye,
  FileText,
  FileType,
  Hash,
  List,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ResultsDisplayProps {
  result: ExtractionResult;
  onReset: () => void;
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [viewMode, setViewMode] = useState<"formatted" | "json">("formatted");

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      toast.success("Data copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const downloadAsJson = () => {
    const dataStr = JSON.stringify(result.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted-data-${result.fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const downloadAsCsv = () => {
    if (typeof result.data !== "object" || result.data === null) {
      toast.error("Cannot convert this data to CSV format");
      return;
    }

    const flattenObject = (
      obj: Record<string, unknown>,
      prefix = "",
    ): Record<string, string> => {
      const flattened: Record<string, string> = {};

      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
          flattened[newKey] = "";
        } else if (typeof value === "object" && !Array.isArray(value)) {
          Object.assign(
            flattened,
            flattenObject(value as Record<string, unknown>, newKey),
          );
        } else if (Array.isArray(value)) {
          flattened[newKey] = value.join(", ");
        } else {
          flattened[newKey] = String(value);
        }
      }

      return flattened;
    };

    const flatData = flattenObject(result.data as Record<string, unknown>);
    const headers = Object.keys(flatData);
    const values = Object.values(flatData);

    const csvContent = [
      headers.join(","),
      values.map((value) => `"${value.replace(/"/g, '""')}"`).join(","),
    ].join("\n");

    const dataBlob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted-data-${result.fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV file downloaded!");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFieldIcon = (value: unknown) => {
    if (value === null || value === undefined) return Hash;
    if (typeof value === "boolean") return CheckCircle;
    if (Array.isArray(value)) return List;
    if (typeof value === "number") return Hash;
    if (typeof value === "object") return Database;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value as string))
      return Calendar;
    return FileType;
  };

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "true" : "false"}
        </Badge>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <List className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {value.length} item{value.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2 pl-4">
            {value.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg"
              >
                <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                  {index + 1}
                </Badge>
                <span className="text-sm">{String(item)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Object
            </span>
          </div>
          {Object.entries(value as Record<string, unknown>).map(
            ([key, val]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{key}:</span>
                </div>
                <div className="ml-4 pl-3 border-l-2 border-primary/20">
                  {renderValue(val)}
                </div>
              </div>
            ),
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* File Info */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-xl">Extraction Complete!</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Successfully extracted data from your document
                </div>
              </div>
            </CardTitle>
            <Button
              onClick={onReset}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Process Another File
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium">Filename</span>
                <p className="text-muted-foreground text-sm">
                  {result.fileName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <span className="text-sm font-medium">File Size</span>
                <p className="text-muted-foreground text-sm">
                  {formatFileSize(result.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <FileType className="h-5 w-5 text-orange-600" />
              <div>
                <span className="text-sm font-medium">File Type</span>
                <p className="text-muted-foreground text-sm">
                  {result.fileType}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            setViewMode(viewMode === "formatted" ? "json" : "formatted")
          }
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-primary/5"
        >
          <Eye className="h-4 w-4" />
          {viewMode === "formatted" ? "View JSON" : "View Formatted"}
        </Button>
        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
        >
          <Copy className="h-4 w-4" />
          Copy Data
        </Button>
        <Button
          onClick={downloadAsJson}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
        >
          <Download className="h-4 w-4" />
          Download JSON
        </Button>
        <Button
          onClick={downloadAsCsv}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Data Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div>Extracted Data</div>
              <div className="text-sm text-muted-foreground font-normal">
                {Object.keys(result.data).length} field
                {Object.keys(result.data).length !== 1 ? "s" : ""} extracted
                successfully
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewMode === "formatted" ? (
            <Accordion
              type="multiple"
              defaultValue={Object.keys(result.data)}
              className="w-full"
            >
              {Object.entries(result.data).map(([key, value], index) => {
                const FieldIcon = getFieldIcon(value);
                return (
                  <AccordionItem
                    key={key}
                    value={key}
                    className="border rounded-lg mb-3 last:mb-0"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30 rounded-t-lg">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-muted rounded-lg">
                          <FieldIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-base">{key}</div>
                          <div className="text-sm text-muted-foreground">
                            {Array.isArray(value)
                              ? `Array with ${value.length} items`
                              : typeof value === "object" && value !== null
                                ? "Object"
                                : typeof value === "boolean"
                                  ? value
                                    ? "True"
                                    : "False"
                                  : typeof value}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-2 border-t border-border/50">
                        {renderValue(value)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="relative">
              <pre className="bg-muted/50 p-6 rounded-lg overflow-x-auto text-sm border border-border">
                <code className="text-muted-foreground">
                  {JSON.stringify(result.data, null, 2)}
                </code>
              </pre>
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="text-xs">
                  JSON
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
