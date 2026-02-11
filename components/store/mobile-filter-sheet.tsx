"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFilters } from "./product-filters";
import { cn } from "@/lib/utils";

interface CategoryWithSlug {
  name: string;
  slug: string;
}

interface MobileFilterSheetProps {
  categories: string[];
  priceRange: { min: number; max: number };
  activeFilterCount: number;
  categoriesWithSlugs?: CategoryWithSlug[];
}

export function MobileFilterSheet({
  categories,
  priceRange,
  activeFilterCount,
  categoriesWithSlugs,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Focus first input when sheet opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready after animation
      const timeout = setTimeout(() => {
        const firstInput = document.querySelector<HTMLInputElement>(
          '[data-slot="sheet-content"] input[type="search"]'
        );
        firstInput?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Handle reset - clear all filters
  const handleReset = useCallback(() => {
    router.push("/products", { scroll: false });
    setOpen(false);
  }, [router]);

  // Handle apply - just close the sheet (filters already applied via URL)
  const handleApply = useCallback(() => {
    setOpen(false);
  }, []);

  // Check if any filters are active
  const hasActiveFilters =
    searchParams.has("q") ||
    searchParams.has("category") ||
    searchParams.has("minPrice") ||
    searchParams.has("maxPrice");

  return (
    <>
      {/* Floating Trigger Button */}
      <Button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 rounded-full shadow-lg",
          "h-14 w-14 p-0",
          "touch-action-manipulation",
          "transition-transform duration-200 motion-reduce:transition-none",
          "hover:scale-105 active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        aria-label={
          activeFilterCount > 0
            ? `Mở bộ lọc, ${activeFilterCount} bộ lọc đang hoạt động`
            : "Mở bộ lọc"
        }
        aria-expanded={open}
        aria-controls="mobile-filter-sheet"
      >
        <SlidersHorizontal className="h-5 w-5" />
        {activeFilterCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px]"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Bottom Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          id="mobile-filter-sheet"
          side="bottom"
          className={cn(
            "max-h-[85vh] rounded-t-2xl",
            "flex flex-col",
            "overscroll-contain",
            "motion-reduce:transition-none motion-reduce:animate-none"
          )}
          style={{ overscrollBehavior: "contain" }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="h-1 w-10 rounded-full bg-muted"
              aria-hidden="true"
            />
          </div>

          {/* Header */}
          <SheetHeader className="px-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                Bộ lọc sản phẩm
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Đóng bộ lọc"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SheetDescription className="sr-only">
              Lọc sản phẩm theo từ khóa, danh mục và giá
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Filter Content */}
          <div
            className="flex-1 overflow-y-auto px-6 py-6"
            style={{ overscrollBehavior: "contain" }}
          >
            <ProductFilters
              categories={categories}
              priceRange={priceRange}
              categoriesWithSlugs={categoriesWithSlugs}
            />
          </div>

          {/* Sticky Footer with Actions */}
          <div className="sticky bottom-0 border-t bg-background px-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReset}
                disabled={!hasActiveFilters}
              >
                Đặt Lại
              </Button>
              <Button className="flex-1" onClick={handleApply}>
                Áp Dụng
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
