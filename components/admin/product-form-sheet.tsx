"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useCallback } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Product } from "@/types";

interface ProductFormSheetProps {
  products: Product[];
  categories?: string[];
}

export function ProductFormSheet({ products, categories = [] }: ProductFormSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const action = searchParams.get("action");
  const editId = searchParams.get("edit");

  const isOpen = action === "new" || !!editId;
  const isEditing = !!editId;
  const productToEdit = editId ? products.find((p) => p.id === editId) : null;

  const handleClose = useCallback(() => {
    router.push("/admin/products");
  }, [router]);

  const handleSuccess = useCallback(() => {
    handleClose();
    router.refresh();
  }, [handleClose, router]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when open
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

  if (!isOpen) return null;

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
            <h2 className="text-lg font-semibold">
              {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? `Đang chỉnh sửa: ${productToEdit?.name || ""}`
                : "Tạo danh sách sản phẩm mới"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Đóng</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <ProductForm
            initialData={productToEdit}
            onSuccess={handleSuccess}
            categories={categories}
          />
        </div>
      </div>
    </>
  );
}
