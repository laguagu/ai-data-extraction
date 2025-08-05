"use client";

import { AlertCircleIcon, FileTextIcon, FileUpIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type;
  const fileName = file.file instanceof File ? file.file.name : file.file.name;

  if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
    return <FileTextIcon className="size-4 opacity-60" />;
  }
  return <FileTextIcon className="size-4 opacity-60" />;
};

interface DocumentUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function DocumentUploader({
  file,
  onFileChange,
}: DocumentUploaderProps) {
  const maxSize = 50 * 1024 * 1024; // 50MB

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: false, // Ei useita tiedostoja
    maxFiles: 1,
    maxSize,
    accept: ".pdf,application/pdf",
    onFilesChange: (uploadedFiles) => {
      // Jos tiedostoja on, ota ensimmäinen, muuten null
      if (uploadedFiles.length > 0) {
        const actualFile =
          uploadedFiles[0].file instanceof File ? uploadedFiles[0].file : null;
        onFileChange(actualFile);
      } else {
        onFileChange(null);
      }
    },
  });

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        role="button"
        onClick={openFileDialog}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload PDF document"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <FileUpIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Upload PDF document</p>
          <p className="text-muted-foreground mb-2 text-xs">
            Drag & drop or click to browse
          </p>
          <div className="text-muted-foreground/70 flex flex-wrap justify-center gap-1 text-xs">
            <span>PDF files only</span>
            <span>∙</span>
            <span>Up to {formatBytes(maxSize)}</span>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      {/* File display - näyttää joko sisäisen tilan tai ulkoisen file-propin */}
      {(files.length > 0 || file) && (
        <div className="space-y-2">
          <div className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
                {files.length > 0 ? (
                  getFileIcon(files[0])
                ) : (
                  <FileTextIcon className="size-4 opacity-60" />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="truncate text-[13px] font-medium">
                  {files.length > 0
                    ? files[0].file instanceof File
                      ? files[0].file.name
                      : files[0].file.name
                    : file?.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(
                    files.length > 0
                      ? files[0].file instanceof File
                        ? files[0].file.size
                        : files[0].file.size
                      : file?.size || 0,
                  )}
                </p>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
              onClick={() => {
                if (files.length > 0) {
                  removeFile(files[0].id);
                }
                onFileChange(null);
              }}
              aria-label="Remove file"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {(files.length > 0 || file) && (
        <p className="text-muted-foreground mt-2 text-center text-xs">
          PDF document ready for data extraction
        </p>
      )}
    </div>
  );
}
