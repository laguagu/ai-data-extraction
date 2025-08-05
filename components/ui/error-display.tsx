"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Copy, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onReset?: () => void;
  showCopy?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  onReset,
  showCopy = true,
}: ErrorDisplayProps) {
  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(error);
      toast.success("Error copied to clipboard");
    } catch {
      toast.error("Failed to copy error");
    }
  };

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm font-mono text-destructive/90">{error}</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {onReset && (
            <Button onClick={onReset} variant="outline" size="sm">
              Start Over
            </Button>
          )}

          {showCopy && (
            <Button onClick={copyError} variant="ghost" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Error
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
