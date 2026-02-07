"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { bulkUpsertProducts } from "@/lib/actions";
import { toast } from "sonner";
import { cn, formatFileSize } from "@/lib/utils";
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
} from "lucide-react";

interface ImportResult {
  created: number;
  updated: number;
  errors: Array<{ row: number; messages: string[] }>;
}

export function ProductImportSheet() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const action = searchParams.get("action");
  const isOpen = action === "import";

  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsDragActive(false);
    router.push("/admin/products");
  }, [router]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-focus close button on open (accessible target for screen readers)
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped?.name.endsWith(".xlsx")) {
      if (dropped) toast.error("Chỉ nhận file .xlsx");
      return;
    }
    if (dropped.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 5MB)");
      return;
    }
    setFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected && !selected.name.endsWith(".xlsx")) {
      toast.error("Chỉ nhận file .xlsx");
    } else if (selected && selected.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn (tối đa 5MB)");
    } else if (selected) {
      setFile(selected);
    }
    // Reset input so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImport() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const res = await bulkUpsertProducts(formData);
        if (res.success) {
          setResult(res.data);
          toast.success(
            `\u0110\u00e3 nh\u1eadp ${res.data.created} m\u1edbi, c\u1eadp nh\u1eadt ${res.data.updated}`
          );
          router.refresh();
        } else {
          setError(res.error ?? "L\u1ed7i kh\u00f4ng x\u00e1c \u0111\u1ecbnh");
          toast.error(res.error ?? "L\u1ed7i kh\u00f4ng x\u00e1c \u0111\u1ecbnh");
        }
      } catch {
        setError("L\u1ed7i k\u1ebft n\u1ed1i. Vui l\u00f2ng th\u1eed l\u1ea1i.");
        toast.error("L\u1ed7i k\u1ebft n\u1ed1i");
      }
    });
  }

  function handleRetry() {
    setFile(null);
    setError(null);
    setResult(null);
  }

  if (!isOpen) return null;

  // Determine which content state to render
  const showFileSelection = !file && !result && !error;
  const showFileSelected = !!file && !result && !error;
  const showSuccess = !!result;
  const showError = !!error && !result;
  const MAX_DISPLAYED_ERRORS = 50;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl bg-background border-l shadow-lg animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-4 border-b">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Nh\u1eadp s\u1ea3n ph\u1ea9m</h2>
            <p className="text-sm text-muted-foreground">
              Nh\u1eadp h\u00e0ng lo\u1ea1t s\u1ea3n ph\u1ea9m t\u1eeb file Excel
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full shrink-0"
            onClick={handleClose}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* State 1: File Selection */}
          {showFileSelection && (
            <div
              role="presentation"
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors outline-none",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium">
                K\u00e9o th\u1ea3 file Excel v\u00e0o \u0111\u00e2y
              </p>
              <p className="mt-2 text-sm text-muted-foreground">ho\u1eb7c</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => fileInputRef.current?.click()}
              >
                Ch\u1ecdn file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Ch\u1ec9 nh\u1eadn file .xlsx (t\u1ed1i \u0111a 5MB, 1.000 d\u00f2ng)
              </p>
            </div>
          )}

          {/* State 2: File Selected */}
          {showFileSelected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border p-4">
                <FileSpreadsheet className="h-8 w-8 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setFile(null)}
                  disabled={isPending}
                  aria-label="X\u00f3a file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    \u0110ang nh\u1eadp...
                  </>
                ) : (
                  "B\u1eaft \u0111\u1ea7u nh\u1eadp"
                )}
              </Button>
            </div>
          )}

          {/* State 4: Success */}
          {showSuccess && (
            <div className="space-y-4">
              <div
                role="alert"
                className="rounded-xl border border-green-200 bg-green-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <p className="text-sm font-medium text-green-800">
                    Nh\u1eadp th\u00e0nh c\u00f4ng
                  </p>
                </div>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>T\u1ea1o m\u1edbi: {result.created}</p>
                  <p>C\u1eadp nh\u1eadt: {result.updated}</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800 mb-2">
                    C\u1ea3nh b\u00e1o ({result.errors.length} l\u1ed7i)
                  </p>
                  <ScrollArea className="h-40">
                    <ul className="space-y-1 text-sm text-amber-700">
                      {result.errors.slice(0, MAX_DISPLAYED_ERRORS).map((err) => (
                        <li key={err.row}>
                          D\u00f2ng {err.row}: {err.messages.join(", ")}
                        </li>
                      ))}
                      {result.errors.length > MAX_DISPLAYED_ERRORS && (
                        <li className="text-amber-600 font-medium">
                          ...v\u00e0 {result.errors.length - MAX_DISPLAYED_ERRORS} l\u1ed7i
                          kh\u00e1c
                        </li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={handleClose}>
                \u0110\u00f3ng
              </Button>
            </div>
          )}

          {/* State 5: Error */}
          {showError && (
            <div className="space-y-4">
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleRetry}>
                Th\u1eed l\u1ea1i
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <a
            href="/api/admin/products/template"
            download
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-4 w-4" />
            T\u1ea3i m\u1eabu Excel
          </a>
        </div>
      </div>
    </>
  );
}
