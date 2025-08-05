import { useState } from "react";
import { toast } from "react-hot-toast";

export type FieldType = {
  type: "text" | "number" | "boolean" | "date" | "array";
  name: string;
  description?: string;
  required?: boolean;
  itemType?: "text" | "number";
};

export type ExtractionMode = "fields" | "description";

export type ExtractionResult = {
  success: boolean;
  data: Record<string, unknown>;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export function useExtraction() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractData = async (
    file: File,
    mode: ExtractionMode,
    fields?: FieldType[],
    description?: string,
  ) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (mode === "fields" && (!fields || fields.length === 0)) {
      toast.error("Please add at least one field for extraction");
      return;
    }

    if (mode === "description" && !description?.trim()) {
      toast.error("Please provide a description of what to extract");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (mode === "fields" && fields) {
        formData.append("fields", JSON.stringify(fields));
      } else if (mode === "description" && description) {
        formData.append("description", description);
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract data");
      }

      setResult(data);
      toast.success("Data extracted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return {
    extractData,
    isLoading,
    result,
    error,
    reset,
  };
}
